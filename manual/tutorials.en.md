In QGis open the "Data Source Manager" and go to the "Vector"-tab select "Source Type" : "File" and search for 
the GeoJSON-file exported from iDAI.field. Open and add it to your QGis-Project. If you have different "Geometry types" in your 
GeoJSON, QGis will have to split the Geometries into homogene layers and thus seperate points, lines and polygons.
Your data is now represented as layers with features, each feature corresponds to one resource in your iDAI.field database.
Check the layers properties to make sure the correct coordinate reference system is selected.

<p align="center"><img src="images/en/resources/import_geojson_qgis.png" alt="Import Geojson to QGIS"/></p>