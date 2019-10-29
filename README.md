# APIGC

## Installation
If you're using a virtual environment use the following commands to create and activate it
- MongoDB, you'll need to store data into a bdd, I choose MongoDB.
To install it, [click here](https://www.mongodb.com/download-center/community?jmp=docs).

- Robot3T, a view in order to have a better visualisation of your data stored into MongoDB.
You should follow this part of openclassroom 
[tutorial](https://openclassrooms.com/fr/courses/4462426-maitrisez-les-bases-de-donnees-nosql/4474601-decouvrez-le-fonctionnement-de-mongodb).

- In order to use the google cloud api, follow this [tutorial](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)
to get your json containing your credentials. Then into the project do the following command and copy the content of the json file into :
```
cd APIGC\data
touch credentials.json
```

## Execution
To start the program use the following command 
but note that a front is also available right [here]() 

### Without the front
Run the command in this order 
```
yarn (or npm) run initDB
```
It will clean the previous database or create a new one after parsing the csv file
```
yarn (or npm) run updateDomColor
```
It will update the records with the google cloud api answer about the dominant color
```
yarn (or npm) run dev
```
It will start the server and listen to the port 3053, to use the api go to this url
and pass it an id, for instance put this url in your browser http://localhost:3053/api/products/L1212-00-T03
It will show you an error message or an array containing urls with the recommendation product
according to the color of the product selected by the id.

### With th front 

Go [there](https://github.com/Raphiqui/APIGC-front) then clone the repository and use the following command 

```
yarn (or npm) run dev
```
Into this folder 
```
yarn start 
```
Into the front folder