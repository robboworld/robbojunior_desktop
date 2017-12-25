#!/bin/bash


POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -s|--start_junior)
    start_junior="$2"
    shift # past argument
    shift # past value
    ;;
    -c|--copy_files)
    copy_files="$2"
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

#echo $start_junior

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

if [[ "$copy_files" = true ]]; then 

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
 
fi

if [[ "$start_junior" = true ]]; then
echo 'npm run start'
npm run start
fi
