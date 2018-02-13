import {isAndroid} from './lib';
import Sound from './Sound';
import iOS from '../iPad/iOS';

import MediaLib from '../iPad/MediaLib';

////////////////////////////////////////////////////
/// Sound Playing
////////////////////////////////////////////////////

let uiSounds = {};
let defaultSounds = ['cut.wav', 'snap.wav', 'copy.wav', 'grab.wav', 'boing.wav', 'tap.wav',
    'keydown.wav', 'entertap.wav', 'exittap.wav', 'splash.wav'];
let projectSounds = {};

let customSounds = [];

let recordedSounds = [];

let custom_sound_index = 0;



export default class ScratchAudio {
    static get uiSounds () {
        return uiSounds;
    }

    static get projectSounds () {
        return projectSounds;
    }

    static get customSounds () {
        return customSounds;
    }

    static get recordedSounds () {
        return recordedSounds;
    }

    static copyRecordedSounds (sounds_arr) {

      sounds_arr.forEach(function(entry) {

              recordedSounds.push(entry);
              ScratchAudio.loadFromLocal('', entry.sound_name);
          });

    }


    static addRecordedSound(sound_name,sound_duration,sound_data){

       console.log('addRecordedSound');

      let sound_object = {};

      let reader = new FileReader();

      reader.onloadend = function(e) {

       sound_object.sound_name = sound_name;
       sound_object.sound_duration = sound_duration;
       sound_object.sound_data = reader.result;


      recordedSounds.push(sound_object);

      };


      reader.readAsDataURL(sound_data);



      }


    static sndFX (name) {
        ScratchAudio.sndFXWithVolume(name, 1.0);
    }

    static sndFXWithVolume (name, volume) {
        if (!isAndroid) {
            if (!uiSounds[name]) {
                return;
            }
            uiSounds[name].play();
        } else {
            AndroidInterface.audio_sndfxwithvolume(name, volume);
        }
    }

    static init (prefix) {
        if (!prefix) {
            prefix = '';
        }
        if (isAndroid) {
            prefix = 'HTML5/';

          //  prefix = '';

        }
        uiSounds = {};

        for (var i = 0; i < defaultSounds.length; i++) {
            ScratchAudio.addSound(prefix + 'sounds/', defaultSounds[i], uiSounds);
        }

      //  ScratchAudio.addSound(prefix, 'pop.mp3', projectSounds);

        let eddition_sounds = MediaLib.sounds;

        for (var i = 0; i < eddition_sounds.length; i++) {
            ScratchAudio.addSound(prefix + 'sounds/', eddition_sounds[i],projectSounds);
        }


    }

    static addSound (url, snd, dict, fcn) {
        var name = snd;
        let sounds_objects_arr =  MediaLib.sounds_objects_arr;
        if (!isAndroid) {
            var whenDone =  function (str) {
                if (str != 'error') {
                    var result = snd.split (',');
                    dict[snd] = new Sound(result[0], result[1]);
                } else {
                    name = 'error';
                }
                if (fcn) {
                    fcn(name);
                }
            };
            iOS.registerSound(url, snd, whenDone);
        } else {
            // In Android, this is handled outside of JavaScript, so just place a stub here.
            dict[snd] = new Sound(url + snd);
            if (fcn) {
                fcn(snd);
            }
        }

       //Edited by Yaroslav
        for (let i = 0; i< sounds_objects_arr.length; i++){

            if (dict[snd].name == sounds_objects_arr[i].sound_name){
                  dict[snd].sound_image =  sounds_objects_arr[i].sound_image;

                  break;

            }
          }
    }

    static soundDone (name) {
        if (!projectSounds[name]) return;
        projectSounds[name].playing = false;
    }

    static loadProjectSound (md5, fcn) {
        if (!md5) {
            return;
        }
        var dir = '';
        if (!isAndroid) {
            if (md5.indexOf('/') > -1) dir = 'HTML5/';
            else if (md5.indexOf('wav') > -1) dir = 'Documents';
        }
        ScratchAudio.loadFromLocal(dir, md5, fcn);
    }

    static loadFromLocal (dir, md5, fcn) {
        if (projectSounds[md5] != undefined) {
            return;
        }

        customSounds[md5] = custom_sound_index;
        custom_sound_index++;
        ScratchAudio.addSound(dir, md5, projectSounds, fcn);
    }
}

window.ScratchAudio = ScratchAudio;
