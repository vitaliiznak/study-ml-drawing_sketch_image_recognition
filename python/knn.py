from sklearn.neighbors import KNeighborsClassifier
from utils import read_feature_file

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
