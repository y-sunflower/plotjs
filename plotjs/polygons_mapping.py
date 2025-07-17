from shapely.geometry import MultiPolygon, Polygon


def _map_polygons_to_data(collection, gdf, tooltip):
    """
    Create a mapping between polygon paths and data indices.
    This handles the case where matplotlib creates more paths
    than we have data points due to multi-part geometries
    (e.g, MultiPolygon).
    """
    paths = collection.get_paths()
    polygon_to_data_mapping = []

    path_index = 0
    for data_idx, geometry in enumerate(gdf.geometry):
        if isinstance(geometry, MultiPolygon):
            # Multi-part geometry - multiple paths for one data point
            for _ in geometry.geoms:
                if path_index < len(paths):
                    polygon_to_data_mapping.append(data_idx)
                    path_index += 1
        elif isinstance(geometry, Polygon):
            # Single polygon - one path for one data point
            if path_index < len(paths):
                polygon_to_data_mapping.append(data_idx)
                path_index += 1
        else:
            # Handle other geometry types
            if path_index < len(paths):
                polygon_to_data_mapping.append(data_idx)
                path_index += 1

    # Ensure we have the right number of mappings
    while len(polygon_to_data_mapping) < len(paths):
        polygon_to_data_mapping.append(len(tooltip) - 1)

    return polygon_to_data_mapping
