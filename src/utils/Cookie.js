
import {isTablet} from './lib';

export default class Cookie {
    // Thanks to http://www.quirksmode.org/js/cookies.html
    static set (key, value) {
        var year = new Date();
        year.setTime(year.getTime() + (365 * 24 * 60 * 60 * 1000));
        var expires = '; expires=' + year.toGMTString();
        let cookie = key + '=' + value + expires + '; path=/';

        if (isTablet){

        document.cookie = cookie;

      }else{

           Cookie.cookie_database_update(cookie);

      }


        //  window.cookie = key + '=' + value + expires + '; path=/';
    }

   static get(key) {

    // var cookies;

     var fcn = function(_cookies,resolve,key){

         key += '=';

         let cookies = _cookies.split(';')

         for (var i = 0; i < cookies.length; i++) {
                   var c = cookies[i];
                   while (c.charAt(0) == ' ') {
                       c = c.substring(1, c.length);
                   }
                   if (c.indexOf(key) == 0) {
                       resolve(c.substring(key.length, c.length));
                   }
               }
               resolve(null);

     }

     return new Promise(resolve => {


       if (!isTablet){

       Cookie.cookie_database_select().then(cookie => {fcn(cookie,resolve,key)});


        }else{

          resolve(document.cookie.split(';'));

        }


     });


     }




    static cookie_database_update(cookie_content){

             var db = openDatabase('jr', '1.0', 'Scratch Junior', 2 * 1024 * 1024);

             db.transaction(function (tx) {

               tx.executeSql("SELECT Count(*) FROM cookies", [], function (tx,results) {



                        if (results.rows.item(0)["Count(*)"] == 0){

                            tx.executeSql("INSERT INTO cookies (id, cookie_content) values(?, ?)", [1, cookie_content], null, null);

                        }else{

                             tx.executeSql("UPDATE cookies SET cookie_content = ?", [cookie_content], null, null);

                        }

                  });
             });


    }

    static cookie_database_select(){

      let cookie = undefined;

        return new Promise(

          resolve => {


                  var db = openDatabase('jr', '1.0', 'Scratch Junior', 2 * 1024 * 1024);

                  db.transaction(function(tx) {

                      tx.executeSql('CREATE TABLE IF NOT EXISTS cookies (id INTEGER PRIMARY KEY, cookie_content)');


                      tx.executeSql("SELECT Count(*) FROM cookies", [], function (t,results) {



                               if (results.rows.item(0)["Count(*)"] == 0){

                                    resolve("");

                               }else{

                                 tx.executeSql("SELECT cookie_content FROM cookies", [], function(tx,result){

                                     cookie =   result.rows.item(0)["cookie_content"];

                                      resolve(cookie);


                                 }, function(tx, error){});

                               }

                         });


                    });


              }


        );



          }

}
