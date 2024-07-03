from sklearn.neighbors import KNeighborsClassifier


classes = {
  "car":0,
  "fish":1,
  "house":2,
  "tree":3,
  "bicycle":4,
  "guitar":5,
  "pencil":6,
  "clock":7
}


training_file = open('../packages/shared_data/dataset/training.csv', 'r')
lines = training_file.readlines()



X = []
y= []
for i in range(1, len(lines)):
    row = lines[i].split(',')
    X.append(
      [ float(row[j]) for j in range(len(row)-1)  ]
    )
    y.append(classes[row[-1].strip()])

print(y[:10])  
print(X[:10])