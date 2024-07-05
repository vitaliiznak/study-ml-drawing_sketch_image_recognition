classes = {
    "car": 0,
    "fish": 1,
    "house": 2,
    "tree": 3,
    "bicycle": 4,
    "guitar": 5,
    "pencil": 6,
    "clock": 7
}


def read_feature_file(file_path):
    X = []
    y = []
    file = open(file_path, 'r')
    lines = file.readlines()
    for i in range(1, len(lines)):
        row = lines[i].split(',')
        X.append(
            [float(row[j]) for j in range(len(row)-1)]
        )
        y.append(classes[row[-1].strip()])
    return (X, y)
