#!/bin/bash

npm run build
rm app.bundle.js
rm app.bundle.js.map

cp ./src/build/bundles/app.bundle.js      ./
cp ./src/build/bundles/app.bundle.js.map  ./ 

npm run start
