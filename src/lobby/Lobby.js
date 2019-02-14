//////////////////////////////////////////////////
// Home Screen
//////////////////////////////////////////////////

import {libInit, getUrlVars, gn, isAndroid, newHTML,newImage_extended} from '../utils/lib';
import ScratchAudio from '../utils/ScratchAudio';
import iOS from '../iPad/iOS';
import Localization from '../utils/Localization';
import Cookie from '../utils/Cookie';

import Home from './Home';
import Samples from './Samples';

import UI from '../editor/ui/UI.js';

let version = undefined;
let busy = false;
let errorTimer;
const host = 'inapp/';
let currentPage = null;

export default class Lobby {
    // Getters/setters for properties used in other classes
    static get version () {
        return version;
    }

    static set busy (newBusy) {
        busy = newBusy;
    }

    static get errorTimer () {
        return errorTimer;
    }

    static appinit (v) {
        libInit();
        version = v;
        var urlvars = getUrlVars();
        var place = urlvars.place;
        ScratchAudio.addSound('sounds/', 'tap.wav', ScratchAudio.uiSounds);
        ScratchAudio.addSound('sounds/', 'cut.wav', ScratchAudio.uiSounds);
        ScratchAudio.init();
        Lobby.setPage(place ? place : 'home');

        if (window.Settings.settingsPageDisabled) {
            gn('settings').style.visibility = 'hidden';
        }

        gn('hometab').ontouchstart = function () {
            if (gn('hometab').className != 'home on') {
                Lobby.setPage('home');
            }
        };
//AZ
        gn('hometab').onmousedown = gn('hometab').ontouchstart;

      /*  gn('helptab').ontouchstart = function () { //modified_by_Yaroslav
            if (gn('helptab').className != 'help on') {
                Lobby.setPage('help');
            }
        };
//AZ
        gn('helptab').onmousedown = gn('helptab').ontouchstart; */

    /*    gn('booktab').ontouchstart = function () { //modified_by_Yaroslav
            if (gn('booktab').className != 'book on') {
                Lobby.setPage('book');
            }
        };
//AZ
        gn('booktab').onmousedown = gn('booktab').ontouchstart; */


        gn('geartab').ontouchstart = function () {
            if (gn('geartab').className != 'gear on') {
                Lobby.setPage('gear');
            }
        };
//AZ
        gn('geartab').onmousedown = gn('geartab').ontouchstart;

        gn('abouttab').ontouchstart = function () {
            if (gn('abouttab').className != 'tab on') {
                Lobby.setSubMenu('about');
            }
        };
//AZ
        gn('abouttab').onmousedown = gn('abouttab').ontouchstart;


        gn('interfacetab').ontouchstart = function () {
            if (gn('interfacetab').className != 'tab on') {
                Lobby.setSubMenu('interface');
            }
        };
//AZ
        gn('interfacetab').onmousedown = gn('interfacetab').ontouchstart;

        gn('painttab').ontouchstart = function () {
            if (gn('painttab').className != 'tab on') {
                Lobby.setSubMenu('paint');
            }
        };
//AZ
        gn('painttab').onmousedown = gn('painttab').ontouchstart;

        gn('blockstab').ontouchstart = function () {
            if (gn('booktab').className != 'tab2 on') {
                Lobby.setSubMenu('blocks');
            }
        };
//AZ
        gn('blockstab').onmousedown = gn('blockstab').ontouchstart;


        //modified_by_Yaroslav //project load button
        gn('project_load').ontouchstart = UI.SjrFileChoose;
//AZ
        gn('project_load').onmousedown = gn('project_load').ontouchstart;


        //modified_by_Yaroslav //sprite upload button
//         gn('sprite_upload').ontouchstart = UI.uploadSpriteFromDisk;
// //AZ
//         gn('sprite_upload').onmousedown = gn('sprite_upload').ontouchstart;
//
//         //modified_by_Yaroslav //background upload button
//         gn('bkg_upload').ontouchstart = UI.uploadBackgroundFromDisk;
// //AZ
//         gn('bkg_upload').onmousedown = gn('bkg_upload').ontouchstart;


        if (isAndroid) {
            AndroidInterface.notifyDoneLoading();
        }
    }

    static setPage (page) {
        if (busy) {
            return;
        }
        if (gn('hometab').className == 'home on') {
            var doNext = function (page) {
                Lobby.changePage(page);
            };
            iOS.setfile('homescroll.sjr', gn('wrapc').scrollTop, function () {
                doNext(page);
            });
        } else {
            Lobby.changePage(page);
        }
    }

    static changePage (page) {
        Lobby.selectButton(page);
        document.documentElement.scrollTop = 0;
        var div = gn('wrapc');
        while (div.childElementCount > 0) {
            div.removeChild(div.childNodes[0]);
        }
        switch (page) {
        case 'home':
            busy = true;
            ScratchAudio.sndFX('tap.wav');
            Lobby.loadProjects(div);
            break;
        case 'help':
            busy = true;
            ScratchAudio.sndFX('tap.wav');
            Lobby.loadSamples(div);
            break;
        case 'book':
            Lobby.loadGuide(div);
            break;
        case 'gear':
            ScratchAudio.sndFX('tap.wav');
            Lobby.loadSettings(div);
            break;
        default:
            break;
        }
        currentPage = page;
    }

    static progressShowing (div,str) {

        // var wc = gn('wrapc');
        // while (wc.childElementCount > 0) {
        //     wc.removeChild(wc.childNodes[0]);
        // }
        // var div = newHTML('div', 'htmlcontents', wc);
        // div.setAttribute('id', 'htmlcontents');


        var ht = newHTML('div', 'progress-ballon', div);
        var h = newHTML('h1', undefined, ht);
        h.setAttribute('id', 'progress-ballon-text');
        h.textContent = str;

          var error_area = gn('error_area');
          error_area.innerHTML = "";

    }

    static updateProgress(obj){

          var error_text = "";
          var error_code = 0;
          var uploaded_assets = 0;

          if (typeof(obj) != 'undefined'){

            if (typeof(obj.error) != 'undefined'){

              if (typeof(obj.error.err_code) != 'undefined'){

                if (obj.error.err_code == 0){

                      if (typeof(obj.uploaded_assets) != 'undefined'){

                          uploaded_assets = obj.uploaded_assets;
                           error_text = "";
                      }

                }else{

                    error_code = obj.error.err_code;
                    error_text = "Error: " + obj.error.err_message + " Error code: " + error_code + " ";

                    if (typeof(obj.error.file_name) != 'undefined'){

                        error_text = error_text + `File name: ${obj.error.file_name}`

                    }

                }

                var text = gn('progress-ballon-text');
                text.textContent =  /*error_text +  */'Files uploaded: ' +  uploaded_assets;

                var error_area = gn('error_area');

                var error_msg = newHTML('div', 'error-msg', error_area);
                error_msg.textContent = error_text;



              }
            }

          }



    }

    static createSpriteBgLoadPage(){

          console.log("createSpriteBgLoadPage");

          document.documentElement.scrollTop = 0;
          var div = gn('wrapc');
          while (div.childElementCount > 0) {
              div.removeChild(div.childNodes[0]);
          }

         // div = newHTML('div', 'sprite-bkgs-load-page', div);
        //  div.setAttribute('id', 'sprite-bkgs-load-page');

           div = newHTML('div', 'htmlcontents sprite-bkgs-load-page', div);
          div.setAttribute('id', 'htmlcontents');

          var title = newHTML('h1', 'upload-image-title', div);

        //  title.textContent = Localization.localize('SELECT_LANGUAGE'); // TODO: localization

          title.textContent = "Загрузка спрайтов и бэкграундов";

          var buttons = newHTML('div', 'upload-image-buttons', div);

          var spriteLoadButton = newHTML('div', 'upload-image-button', buttons);
          spriteLoadButton.setAttribute('id', 'sprite_upload');

          spriteLoadButton.textContent = 'Upload sprites';  // TODO: localization

          spriteLoadButton.ontouchstart = function (e) {
              ScratchAudio.sndFX('tap.wav');

              Lobby.progressShowing(div,"");
               UI.uploadSpriteFromDisk(Lobby.updateProgress);

          };
          spriteLoadButton.onmousedown = spriteLoadButton.ontouchstart;


          var bkgLoadButton = newHTML('div', 'upload-image-button', buttons);
          bkgLoadButton.setAttribute('id', 'bkg_upload');

          bkgLoadButton.textContent = 'Upload bkgs'; // TODO: localization

          bkgLoadButton.ontouchstart = function (e) {
              ScratchAudio.sndFX('tap.wav');

              Lobby.progressShowing(div,"");
               UI.uploadBackgroundFromDisk(Lobby.updateProgress);

          };
          bkgLoadButton.onmousedown = bkgLoadButton.ontouchstart;


          var arrow_image = newImage_extended(div,'assets/lobby/back-to-home-arrow.svg',{},'back-to-home-arrow'); //modified_by_Yaroslav

           arrow_image.ontouchstart =  Lobby.setPage.bind(this,'gear');;

          arrow_image.onmousedown = arrow_image.ontouchstart;


          var error_area = newHTML('div', 'error-area', div);
          error_area.setAttribute('id', 'error_area');


    }

    static loadProjects (p) {
        document.ontouchmove = undefined;
        gn('topsection').className = 'topsection home';
        gn('tabheader').textContent = Localization.localize('MY_PROJECTS');
        gn('subtitle').textContent = '';
        gn('footer').className = 'footer off';
        gn('wrapc').scrollTop = 0;
        gn('wrapc').className = 'contentwrap scroll';
        var div = newHTML('div', 'htmlcontents home', p);
        div.setAttribute('id', 'htmlcontents');

        // var arrow_image = newImage_extended(div,'assets/lobby/navigation-arrow.svg',{},'arrow-image'); //modified_by_Yaroslav
        //
        //  arrow_image.ontouchstart = Lobby.createSpriteBgLoadPage;
        //
        // arrow_image.onmousedown = arrow_image.ontouchstart;


        Home.init();
    }

    static loadSamples (p) {
        gn('topsection').className = 'topsection help';
        gn('tabheader').textContent = Localization.localize('QUICK_INTRO');
        gn('subtitle').textContent = Localization.localize('SAMPLE_PROJECTS');
        gn('footer').className = 'footer off';
        gn('wrapc').scrollTop = 0;
        gn('wrapc').className = 'contentwrap noscroll';
        var div = newHTML('div', 'htmlcontents help', p);
        div.setAttribute('id', 'htmlcontents');
        document.ontouchmove = function (e) {
            e.preventDefault();
        };
        Samples.init();
    }

    static loadGuide (p) {
        gn('topsection').className = 'topsection book';
        gn('footer').className = 'footer on';
        var div = newHTML('div', 'htmlcontents home', p);
        div.setAttribute('id', 'htmlcontents');
        setTimeout(function () {
            Lobby.setSubMenu('about');
        }, 250);
    }

    static loadSettings (p) {
        // loadProjects without the header
        gn('topsection').className = 'topsection book';
        gn('footer').className = 'footer off';
        gn('wrapc').scrollTop = 0;
        gn('wrapc').className = 'contentwrap scroll';
        var div = newHTML('div', 'htmlcontents settings', p);
        div.setAttribute('id', 'htmlcontents');

        var arrow_image = newImage_extended(div,'assets/lobby/navigation-arrow.svg',{},'arrow-image'); //modified_by_Yaroslav

         arrow_image.ontouchstart = Lobby.createSpriteBgLoadPage;

        arrow_image.onmousedown = arrow_image.ontouchstart;

        // Localization settings
        var title = newHTML('h1', 'localizationtitle', div);
        title.textContent = Localization.localize('SELECT_LANGUAGE');

        var languageButtons = newHTML('div', 'languagebuttons', div);

        var languageButton;
        for (var l in window.Settings.supportedLocales) {
            var selected = '';
            if (window.Settings.supportedLocales[l] == Localization.currentLocale) {
                selected = ' selected';
            }
            languageButton = newHTML('div', 'localizationselect' + selected, languageButtons);
            languageButton.textContent = l;

            languageButton.ontouchstart = function (e) {
                ScratchAudio.sndFX('tap.wav');
                let newLocale = window.Settings.supportedLocales[e.target.textContent];
                Cookie.set('localization', newLocale);
                iOS.analyticsEvent('lobby', 'language_changed', newLocale);
                window.location = '?place=gear';
            };
            languageButton.onmousedown = languageButton.ontouchstart;
        }
    }

    static setSubMenu (page) {
        if (busy) {
            return;
        }
        document.ontouchmove = undefined;
        busy = true;
        ScratchAudio.sndFX('tap.wav');
        Lobby.selectSubButton(page);
        document.documentElement.scrollTop = 0;
        gn('wrapc').scrollTop = 0;
        var div = gn('wrapc');
        while (div.childElementCount > 0) {
            div.removeChild(div.childNodes[0]);
        }
        var url;
        switch (page) {
        case 'about':
            url = host + 'about.html';
            Lobby.loadLink(div, url, 'contentwrap scroll', 'htmlcontents scrolled');
            break;
        case 'interface':
            document.ontouchmove = function (e) {
                e.preventDefault();
            };
            url = host + 'interface.html';
            Lobby.loadLink(div, url, 'contentwrap noscroll', 'htmlcontents fixed');
            break;
        case 'paint':
            document.ontouchmove = function (e) {
                e.preventDefault();
            };
            url = host + 'paint.html';
            Lobby.loadLink(div, url, 'contentwrap noscroll', 'htmlcontents fixed');
            break;
        case 'blocks':
            url = host + 'blocks.html';
            Lobby.loadLink(div, url, 'contentwrap scroll', 'htmlcontents scrolled');
            break;
        default:
            Lobby.missing(page, div);
            break;
        //url =  Lobby.loadProjects(div); break;
        }
    }

    static selectSubButton (str) {
        var list = ['about', 'interface', 'paint', 'blocks'];
        for (var i = 0; i < list.length; i++) {
            var kid = gn(list[i] + 'tab');
            var cls = kid.className.split(' ')[0];
            kid.className = cls + ((list[i] == str) ? ' on' : ' off');
        }
    }

    static selectButton (str) {
        var list = ['home', 'help', 'book', 'gear'];
        for (var i = 0; i < list.length; i++) {
            if (str == list[i]) {
                gn(list[i] + 'tab').className = list[i] + ' on';
            } else {
                gn(list[i] + 'tab').className = list[i] + ' off';
            }
        }
    }

    static loadLink (p, url, css, css2) {
        document.documentElement.scrollTop = 0;
        gn('wrapc').scrollTop = 0;
        gn('wrapc').className = css;
        var iframe = newHTML('iframe', 'htmlcontents', p);
        iframe.setAttribute('id', 'htmlcontents');
        gn('htmlcontents').className = css2;
        gn('htmlcontents').src = url;
        gn('htmlcontents').onload = function () {
            if (errorTimer) {
                clearTimeout(errorTimer);
            }
            errorTimer = undefined;
            busy = false;
            gn('wrapc').scrollTop = 0;
        };
        errorTimer = window.setTimeout(function () {
            Lobby.errorLoading('Loading timeout');
        }, 20000);
    }

    static errorLoading (str) {
        if (errorTimer) {
            clearTimeout(errorTimer);
        }
        errorTimer = undefined;
        var wc = gn('wrapc');
        while (wc.childElementCount > 0) {
            wc.removeChild(wc.childNodes[0]);
        }
        var div = newHTML('div', 'htmlcontents', wc);
        div.setAttribute('id', 'htmlcontents');
        var ht = newHTML('div', 'errormsg', div);
        var h = newHTML('h1', undefined, ht);
        h.textContent = str;
        busy = false;
    }

    static missing (page, p) {
        gn('wrapc').className = 'contentwrap scroll';
        var div = newHTML('div', 'htmlcontents', p);
        div.setAttribute('id', 'htmlcontents');
        div = newHTML('div', 'errormsg', div);
        var h = newHTML('h1', undefined, div);
        h.textContent = page.toUpperCase() + ': UNDER CONSTRUCTION';
        busy = false;
    }

    static goHome () {
        if (currentPage === 'home') {
            window.location.href = 'index.html?back=true';
        } else {
            Lobby.setPage('home');
        }
    }
}
