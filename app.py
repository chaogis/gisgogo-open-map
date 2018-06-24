from flask import Flask, request, render_template, jsonify
import psycopg2
import json
from geojson import loads, Feature, FeatureCollection

import urllib.request

db_host = "localhost"
db_user = "postgres"
db_passwd = "postgis"
db_database = "climate_db"
db_port = "5432"

app = Flask(__name__)

def get_conn():
     # connect to DB
    conn = psycopg2.connect(host=db_host, user=db_user, 
    port=db_port, password=db_passwd, database=db_database)

    return conn

def close(cur, conn):
    if cur:
        cur.close()
    if conn:
        conn.close()

def fetchall(sql):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql)
    dbRows = cur.fetchall()
    close(cur, conn)

    return dbRows

def crt_geojson(sql):
    dbRows = fetchall(sql)
    # an empty list to hold each feature of our feature collection
    new_geom_collection = []

    # loop through each row in result query set and add to my feature collection
    # assign name field to the GeoJSON properties
    for each_poly in dbRows:
        geom = each_poly[0]
        name = each_poly[1]
        id = each_poly[2]
        geoj_geom = loads(geom)
        myfeat = Feature(geometry=geoj_geom, properties={'name': name, 'id': id})
        new_geom_collection.append(myfeat)

    # use the geojson module to create the final Feature Collection of features created from for loop above
    my_geojson = FeatureCollection(new_geom_collection)
    
    return my_geojson

@app.route('/todo/api/v1.0/stations', methods=['GET'])
def get_stations():
    station_query = """select ST_AsGeoJSON(geom) as geom, station_name, station_id 
                      from public.surf_chn_climate_station"""
    my_geojson = crt_geojson(station_query)

    return str(my_geojson)

@app.route('/todo/api/v1.0/stations/<string:province_code>', methods=['GET'])
def get_station(province_code):
    station_query = """select ST_AsGeoJSON(geom) as geom, station_name, station_id 
                      from public.surf_chn_climate_station where province_code='%s'""" % province_code.strip()
    my_geojson = crt_geojson(station_query)
    
    return str(my_geojson)

@app.route('/todo/api/v1.0/provinces', methods=['GET'])
def get_provinces():
    province_query = """select ST_AsGeoJSON(geom) as geom, province_name, province_code 
                      from public.chn_province_polygon
                      where province_name is not null"""
    my_geojson = crt_geojson(province_query)

    return str(my_geojson)

@app.route('/todo/api/v1.0/provinces/<string:province_code>', methods=['GET'])
def get_province(province_code):
    province_query = """select ST_AsGeoJSON(geom) as geom, province_name, province_code 
                      from public.chn_province_polygon where province_code='%s'""" % province_code.strip()
    my_geojson = crt_geojson(province_query)
    
    return str(my_geojson)

#chn_province_polygon
@app.route('/todo/api/v1.0/allprovince', methods=['GET'])
def get_allprovince():
    allprovince_query = """select distinct province_code, province_name from chn_province_polygon where province_code is not null"""
    dbRows = fetchall(allprovince_query)
    result = {'status': 'success'}
    provinces = []
    for row in dbRows:
        provinces.append({'pcode':row[0], 'name': row[1]})
    result['data'] = provinces

    return json.dumps(result)

@app.route('/todo/wfs/v1.0/proxy', methods=['POST'])
def wfs_proxy():
    result = {"errMsg": "请求失败"}
    jdata = request.get_json()
    if request.json:
        gsUrl = jdata['gsUrl']
        service = jdata['service']
        version = jdata['version']
        request1 = jdata['request']
        typeName = jdata['typeName']
        outputFormat = jdata['outputFormat']
        srsname = jdata['srsname']
        bbox = jdata['bbox']
        url = gsUrl + '?service=' + service + '&version=' + version + '&request=' + request1 + '&typeName=' + typeName + '&outputFormat=' + outputFormat + '&srsname=' + srsname + '&bbox=' + bbox
        print(url)
        result = urllib.request.urlopen(url).read() #结果为字节型 b'   b'

    return result.decode('utf-8')#转换为字符串

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='172.27.0.12', port=80, debug=True)
