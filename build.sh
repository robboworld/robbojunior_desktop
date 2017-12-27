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

##rm -r ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/
##rm -r ./build_ditribution_package/linux/robbojunior/opt/junior-x32/jr/resources/app/

FILES=()
FORBIDDEN=("build_distribution_package","src",".git","build.sh","README.md",".gitignore")

#FILES=$(find .)

FILES=$(ls -l | sed -n 's/^d\([^ ]*[ ]*\)\{8\}\(.*\)/\2/p') 

echo ${!FILES[*]}

for index in ${!FILES[*]}
do
 for forb_index in ${!FORBIDDEN[*]}
    do
    if [[ "${FILES[$index]}" != *"${FORBIDDEN[$forb_index]}"* ]]; then 
            echo " "
    fi 
      
 done
   #forb_index=0
    echo $index
done

#echo $FILES

#rm -r ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/css
#rm -r ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/inapp
#rm -r ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/localization
#rm -r ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/samples
#rm -r ./build_ditribution_package/linux/robbojunior/opt/junior/jr/resources/app/sounds


 
fi

if [[ "$start_junior" = true ]]; then
echo 'npm run start'
npm run start
fi
