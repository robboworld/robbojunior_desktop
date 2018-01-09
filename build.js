const fs = require('fs-extra')


const Folder = './';
const dist_folder_arr = ["./build_distribution_package/linux/robbojunior/opt/junior/jr/resources/app/","./build_distribution_package/linux/robbojunior-x32/opt/junior/jr/resources/app/"];

var copyFiles = function(){




var Files_arr = [];

fs.readdir(Folder, (err, files) => {
  files.forEach(file => {
  
            
        FilterFunc(file);    


  });
})

}
//Files_arr.forEach(entry => console.log(entry));


var FilterFunc = function(file){

var fileName = "";

var FORBIDDEN = ["build_distribution_package","src",".git","build.sh","build.sh.old","build.js","README.md",".gitignore","node_modules"];


//FORBIDDEN.forEach(entry => {if (entry != file) console.log(file); else console.log("forbidden")});

if ( FORBIDDEN.indexOf(file) == -1  ) 

{

  // console.log(file);


  /*  if ( fs.lstatSync("./"+file).isFile() ) {

          fileName = file;
    

            }
    else{


            fileName = "";


        }   */


        

    fs.copy('./' + file, dist_folder_arr[0] + file)
        .then(() => {
            console.log( file + ' was sucessfully copied to' +  dist_folder_arr[0]);
            })
        .catch(err => {
          console.error(err)
            })
       

     fs.copy('./' + file, dist_folder_arr[1] +file)
        .then(() => {
           console.log( file + ' was sucessfully copied to' +  dist_folder_arr[1]);
            })
        .catch(err => {
          console.error(err)
            })

  

}





};


copyFiles();
