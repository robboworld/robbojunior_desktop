import IO from './IO';
import Localization from '../utils/Localization';

let path;
let samples;
let backgrounds;
let sprites;
let sounds = [];
let sounds_objects_arr;
let keys = {};

export default class MediaLib {
    static get path () {
        return path;
    }

    static get samples () {
        return samples;
    }

    static get sprites () {
        return sprites;
    }

    static get backgrounds () {
        return backgrounds;
    }

    static get sounds () {
        return sounds;
    }

    static get sounds_objects_arr () {
        return sounds_objects_arr;
    }

    static get keys () {
        return keys;
    }

    static set sprites (data) {
        sprites = data;
    }

    static set backgrounds (data) {
        backgrounds = data;
    }

    static loadMediaLib (root, whenDone) {
        IO.requestFromServer(root + 'media.json', (result) => {
            let parsedResult = JSON.parse(result);
            path = parsedResult.path;
            samples = parsedResult.samples;
            sprites = parsedResult.sprites;
            backgrounds = parsedResult.backgrounds;
            sounds_objects_arr = parsedResult.sounds;

          for (let i = 0; i< sounds_objects_arr.length; i++){

              sounds.push(sounds_objects_arr[i].sound_name);

          }


          var json = {};
           json.items = ['*'];


        var query_custom_bkgs = function(cb){

          IO.query('custombkgs', json, (results) => {
                results = JSON.parse(results);

                if (results.length != 0) {
                    //  let obj =  Object.assign(sprites, results);
                    let length = backgrounds.length;
                    for (let i = 0; i < results.length; i++) {
                        backgrounds[length + i] = results[i];

                        backgrounds[length + i].md5 = backgrounds[length + i].md5 + "_custom" + "." + backgrounds[length + i].ext;
                        backgrounds[length + i].altmd5 = backgrounds[length + i].altmd5 + "_custom" + "." + backgrounds[length + i].ext;

                        console.log(`adding custom background ${backgrounds[length + i].md5}`);
                    }
                    MediaLib.localizeMediaNames();
                    MediaLib.generateKeys();
                    whenDone();
                } else {
                    MediaLib.localizeMediaNames();
                    MediaLib.generateKeys();
                    whenDone();
                }
            });
        }


        IO.query('customsprites', json, (results) => {

                results = JSON.parse(results);

                  if (results.length != 0) {

                //  let obj =  Object.assign(sprites, results);

                let length = sprites.length;

                  for (let i = 0; i < results.length; i++) {

                      sprites[length + i] = results[i];

                      sprites[length + i].md5 = sprites[length + i].md5 + "_custom" + "." + sprites[length + i].ext;
                      sprites[length + i].altmd5 = sprites[length + i].altmd5 + "_custom" + "." + sprites[length + i].ext;


                      console.log(`adding custom sprite ${sprites[length + i].md5}`);

                  }


                  query_custom_bkgs();





                    // MediaLib.localizeMediaNames();
                    // MediaLib.generateKeys();
                    //
                    // whenDone();

                  }else{

                    query_custom_bkgs();

                    // MediaLib.localizeMediaNames();
                    // MediaLib.generateKeys();
                    //
                    // whenDone();


                  }

          });


            // MediaLib.localizeMediaNames();
            // MediaLib.generateKeys();
            //
            // whenDone();
        });
    }

    static localizeMediaNames () {
        // Localize names of sprites
        for (let i = 0; i < sprites.length; i++) {
            sprites[i].name = Localization.localize('CHARACTER_' + sprites[i].md5);
        }

        // Localize names of backgrounds
        for (let i = 0; i < backgrounds.length; i++) {
            backgrounds[i].name = Localization.localize('BACKGROUND_' + backgrounds[i].md5);
        }
    }

    static generateKeys () {
        for (let i = 0; i < backgrounds.length; i++) {
            var bg = backgrounds[i];
            keys[bg.md5] = {width: bg.width, height: bg.height, name: bg.name};
        }

        for (let i = 0; i < sprites.length; i++) {
            var spr = sprites[i];
            keys[spr.md5] = {width: spr.width, height: spr.height, name: spr.name,need_flip:spr.need_flip};
        }
    }
}
