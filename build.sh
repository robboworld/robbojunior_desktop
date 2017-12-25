#!/bin/bash

echo 'npm run build'

npm run build

echo 'rm app.bundle.js'
rm app.bundle.js

echo 'rm app.bundle.js.map'
rm app.bundle.js.map

echo 'cp ./src/build/bundles/app.bundle.js      ./'
cp ./src/build/bundles/app.bundle.js      ./

echo 'cp ./src/build/bundles/app.bundle.js.map  ./'
cp ./src/build/bundles/app.bundle.js.map  ./ 

echo 'rm ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/app.bundle.js'
rm ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/app.bundle.js

echo 'rm ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/app.bundle.js.map'
rm ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/app.bundle.js.map

echo 'cp ./app.bundle.js      ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/'
cp ./app.bundle.js      ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/

echo 'cp ./app.bundle.js.map  ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/ '
cp ./app.bundle.js.map  ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/ 

echo 'rm ./build_ditribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/app.bundle.js'
rm ./build_ditribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/app.bundle.js

echo 'rm ./build_ditribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/app.bundle.js.map'
rm ./build_ditribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/app.bundle.js.map

echo 'cp ./app.bundle.js      ./build_ditribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/'
cp ./app.bundle.js      ./build_ditribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/

echo 'cp ./app.bundle.js.map  ./build_ditribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/ '
cp ./app.bundle.js.map  ./build_ditribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/ 


echo 'npm run start'
npm run start
