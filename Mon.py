from flask import Flask, render_template, jsonify
import oracledb
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('query.html')

@app.route('/get-data')
def get_data():
    conn = oracledb.connect("test/test@test.ru")
    cur = conn.cursor()

    query = """
    SELECT s.code, COUNT(s.application_id) AS count_app_id
    FROM cl_la.status s
    LEFT JOIN product_content pc ON pc.application_id = s.application_id
    LEFT JOIN trade_point tp ON tp.application_id = s.application_id AND tp.type = 'registration'
    LEFT JOIN cl_catalog.channel_type cht ON cht.code = tp.channel_code
    WHERE s.current_status = 1
          AND status_date < SYSDATE - 1 / 24 / 5
          AND pc.type = '0'
          AND pc.product_class = 'GP'
          AND s.code NOT IN ('Denied.Done',
                             'Completed.Done',
                             'Refused.Done',
                             'LoanDetailsReceiving',
                             'CCLoanDetailsReceiving',
                             'AdditionalFilling',
                             'ApplicationDataReceiving',
                             'EnterEAN',
                             'ESigningDocs',
                             'SigningDocuments')
    GROUP BY s.code
    """

    cur.execute(query)
    result = cur.fetchall()

    cur.close()
    conn.close()

    # Преобразуем результат в список словарей
    data = [dict(zip(["code", "count_app_id"], row)) for row in result]

    # Вычисляем общий итог
    total_count = sum(item["count_app_id"] for item in data)
    total = {"Названия строк": "Общий итог", "Количество по полю Application ID": total_count}

    # Возвращаем данные с общим итогом
    return jsonify({'data': data, 'total': total})

from flask import send_file
import pandas as pd
import oracledb
import datetime
import xlsxwriter
import os

@app.route('/download-excel')
def download_excel():
    conn = oracledb.connect("test/test@test.ru")
    cur = conn.cursor()

    query = """select distinct s.application_id,
                    s.code,
                    cast(s.status_date as date),
                    pc.product_class, cht.description
    from cl_la.status s
    left join product_content pc
        on pc.application_id = s.application_id
    left join trade_point tp on tp.application_id = s.application_id and tp.type ='registration'
    left join cl_catalog.channel_type cht on cht.code = tp.channel_code
    where s.current_status = 1
        --and status_date > to_date('04.07.2023 7', 'dd.mm.yyyy hh24')
        and status_date < sysdate - 1 / 24 / 5
        and pc.type = '0'
        and pc.product_class = 'GP'
        and s.code not in ('Denied.Done',
                            'Completed.Done',
                            'Refused.Done',
                            'LoanDetailsReceiving',
                            'CCLoanDetailsReceiving',
                            'AdditionalFilling',
                            'ApplicationDataReceiving',
                            'EnterEAN',
                            'ESigningDocs',
                            'SigningDocuments')"""
    cur.execute(query)
    result = cur.fetchall()
    cur.close()
    conn.close()

    # Создаем DataFrame из результата запроса
    df = pd.DataFrame(result, columns=['application_id', 'code', 'status_date', 'product_class', 'description'])

    # Создаем сводную таблицу по 'code' и количеству 'application_id'
    pivot_table = df.groupby('code')['application_id'].count().reset_index()
    pivot_table.columns = ['Названия строк', 'Количество по полю Application ID']

    # Добавляем строку "Общий итог"
    total_count = pivot_table['Количество по полю Application ID'].sum()
    total_row = pd.DataFrame({'Названия строк': ['Общий итог'], 'Количество по полю Application ID': [total_count]})
    pivot_table = pd.concat([pivot_table, total_row], ignore_index=True)

    # Сохраняем данные в Excel с форматированием
    current_time = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_path = "/opt/foa/Mon/_internal/downloads"  # путь к папке
    file_name = f"{file_path}/unloading_{current_time}.xlsx"

    with pd.ExcelWriter(file_name, engine='xlsxwriter') as writer:
        # Форматирование для листа Table NKK
        df.to_excel(writer, index=False, sheet_name='Table NKK')
        worksheet = writer.sheets['Table NKK']
        number_format = writer.book.add_format({'num_format': '0'})
        for col_num, value in enumerate(['A', 'B', 'C', 'D', 'E'], start=1):
            worksheet.set_column(f'{value}:{value}', 25, number_format)

        # Форматирование для листа Pivot Table NKK
        pivot_table.to_excel(writer, index=False, sheet_name='Pivot Table NKK')
        worksheet_pivot = writer.sheets['Pivot Table NKK']
        for col_num, value in enumerate(['A', 'B'], start=1):
            worksheet_pivot.set_column(f'{value}:{value}', 45)
    
    os.chmod(file_path, 0o777)

    return send_file(file_name, as_attachment=True)

if __name__ == '__main__':
    app.run(host='10.150.2.158', port=61220, debug=False, threaded=True)