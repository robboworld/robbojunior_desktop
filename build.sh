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


 if hash node 2>/dev/null; then
        echo "Nodejs is installed. "
    else
        echo "Nodejs  is not installed"
        echo "Trying to install it automatically"
        echo "curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -"
        echo "sudo apt-get install -y nodejs" 

        curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

if [ ! -d "./node_modules" ]; then
 
    echo "First start. Installing depedencies..."
    npm install

fi

echo 'npm run build'

npm run build

sed -i -e '1 s/^/const node_fs = require("fs");\n/;' ./src/build/bundles/app.bundle.js
sed -i -e '1 s/^/const node_os = require("os");\n/;' ./src/build/bundles/app.bundle.js
sed -i -e '1 s/^/const node_process = require("process");\n/;' ./src/build/bundles/app.bundle.js


echo 'rm app.bundle.js'
rm app.bundle.js

echo 'rm app.bundle.js.map'
rm app.bundle.js.map

echo 'cp ./src/build/bundles/app.bundle.js      ./'
cp ./src/build/bundles/app.bundle.js      ./

echo 'cp ./src/build/bundles/app.bundle.js.map  ./'
cp ./src/build/bundles/app.bundle.js.map  ./ 

if [[ "$copy_files" = true ]]; then 

node build.js


 
fi

if [[ "$start_junior" = true ]]; then
echo 'npm run start'
npm run start
fi
