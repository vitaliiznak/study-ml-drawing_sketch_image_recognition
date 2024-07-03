from sklearn.neighbors import KNeighborsClassifier

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


knn = KNeighborsClassifier(
    n_neighbors=50,
    algorithm='brute',
    weights='uniform')

training_csv_path = '../packages/shared_data/dataset/training.csv'

X, y = read_feature_file(training_csv_path)

knn.fit(X, y)

testing_csv_path = read_feature_file(
    '../packages/shared_data/dataset/testing.csv')

accuracy = knn.score(X, y)
print("Accuracy: ", accuracy)
