import ScratchJr from '../ScratchJr';
import Project from '../ui/Project';
import Prims from './Prims';
import Thread from './Thread';
import {gn,isTablet} from '../../utils/lib';


export default class Runtime {
    constructor () {
        this.threadsRunning = [];
        this.thread = undefined;
        this.intervalId = undefined;
        this.yield = false;

        this.robot_version = undefined;

        this.start_robot_version_checking_process = false;
      //  this.thread.robot_version = this.robot_version;


    }

    beginTimer () {
       console.log("[engine] begin timer");

        if (this.intervalId != null) {
            window.clearInterval(this.intervalId);
        }



        var rt = this;
        this.intervalId = window.setInterval(function () {
            rt.get_robot_version_and_tickTask(rt);  //rt.tickTask()
        }, 32);
        Project.saving = false;
        // Prims.time = (new Date() - 0);
        this.threadsRunning = [];
    }

   get_robot_version_and_tickTask(rt){

     let robot_version_table = [0,3];

     let checked_versions_count = 0

     let robot_version;


    if ((((rt.robot_version == undefined)  && (!isTablet)/*&& (!rt.start_robot_version_checking_process)*/) /*|| (rt.robot_version == -1)*/) /*&& (!rt.start_robot_version_checking_process)*/){
    //alert(this.robot_version);

    //alert("tick_task");

    //  window.clearInterval(this.intervalId);


    rt.start_robot_version_checking_process = true;

     for (var g=0;g< robot_version_table.length;g++){
     //alert(gi);
        rt.check_robot_version(robot_version_table[g],g)
            .then(
                (response) => {

                            checked_versions_count++;

                                var gi = response.gi;

                              console.log(`[src::editor::engine::Runtime.js::robot_response:] ${response.response_data} gi:${gi}`);

                          // if (rt.thread != undefined){

                            //   alert("gi_1: " + gi);
                             if (response.response_data.indexOf("error") == -1){
                                rt.robot_version = robot_version_table[gi];

                              //  rt.thread.robot_version = rt.robot_version;

                              console.log("[src::editor::engine::Runtime.js::rt.robot_version: ] " + rt.robot_version);

                                gn("robot_connection_status").style.backgroundColor = "green";

                             rt.tickTask();

                            /* this.intervalId = window.setInterval(function () {
                                 rt.get_robot_version_and_tickTask(rt);  //rt.tickTask()
                             }, 32); */

                           }else if ( checked_versions_count >= 2 /*gi ==  robot_version_table.length-1*/){

                              //  alert("gi_2: " + gi);
                                 rt.robot_version = -1;

                                  console.log("[src::editor::engine::Runtime.js::rt.robot_version: ] " + rt.robot_version);

                                  console.log("Не возможно определить версию робота. Проверьте подключение.");

                                  gn("robot_connection_status").style.backgroundColor = "red";

                              //    alert("Не возможно определить версию робота. Проверьте подключение.");


                               }



                            //    }
                              },
                 error => {

                   rt.robot_version = -1;

                     gn("robot_connection_status").style.backgroundColor = "red";

                  // alert(`Ошибка: ${error}`);
                /*
                   this.intervalId = window.setInterval(function () {
                       rt.get_robot_version_and_tickTask(rt);  //rt.tickTask()
                   }, 32); */

               }
            );

     /*
        if ((rt.robot_version != undefined) || (rt.robot_version == -1)) {

        // alert("rt.robot_version: " + rt.robot_version);
          break;
        } */
     }

   }
   else{
      rt.tickTask()

   }


   }

   tickTask () {
    /*  this.intervalId = window.setInterval(function () {
          this.get_robot_version_and_tickTask(this);  //rt.tickTask()
      }, 32); */

      // console.log("tick_task" + new Date());

        ScratchJr.updateRunStopButtons();


      //  console.log("[engine] threads=" + this.threadsRunning.length);


        if (this.threadsRunning.length < 1) {
            return;
        }



        var activeThreads = [];
        for (var i = 0; i < this.threadsRunning.length; i++) {
            if (this.threadsRunning[i].isRunning) {
                activeThreads.push(this.threadsRunning[i]);
            }
        }
        this.threadsRunning = activeThreads;
        for (var j = 0; j < this.threadsRunning.length; j++) {
            this.step(j);
        }
    }

    inactive () {
        if (this.threadsRunning.length < 1) {
            return true;
        }
        var inactive = true;
        for (var i = 0; i < this.threadsRunning.length; i++) {
            var t = this.threadsRunning[i];
            if (!t) {
                continue;
            }
            if (t.isRunning && (t.firstBlock.blocktype != 'ontouch')) {
                inactive = false;
            }
            if ((t.firstBlock.blocktype == 'ontouch') && (t.thisblock != null)
                && (t.thisblock.blocktype != 'ontouch')) {
                inactive = false;
            }
        }
        return inactive;
    }





   check_robot_version(version,gi){
    let url = `http://127.0.0.1:9876/txt/def/${version}/rob_check`;
    let gi_2 = gi;

     return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function() {
        if (this.status == 200) {
          let response = {};
          response.response_data =   this.response;
          response.gi = gi_2;
        resolve(response);
        } else {
         var error = new Error(this.statusText);
        error.code = this.status;
         reject(error);
         }
       };

      xhr.onerror = function() {
      reject(new Error("Network Error"));
      };

     xhr.send();
    });
   }







    get_robot_version(){
       let robot_version_table = [0,3];
       let robot_version;

       for (let i=0;i< robot_version_table.length;i++){
          this.check_robot_version(robot_version_table[i])
              .then(
                   response => alert(`Response: ${response} i:${i}`),
                   error => alert(`Error: ${error}`)
              );
       }
       return 0;
    }





    step(n) {
  //     console.log("[engine] step=" + n);
        this.yield = false;
        this.thread = this.threadsRunning[n];

        while(true) { // eslint-disable-line no-constant-condition
            if (!this.thread.isRunning) {
                return;
            }
            if (this.thread.waitTimer > 0) {
              //  console.log("[Engine::Runtime.js::waitTimer:] " + this.thread.waitTimer);
                this.thread.waitTimer += -1;
                return;
            }

          //   if (this.robot_version != undefined){
              this.thread.robot_version =  this.robot_version;

          //  }
          /*else{

                alert("Не возможно определить версию робота. Прерываем выполнение.")ж
                return;

            }*/

            //  if (this.thread.spr.parentNode.id == "frame") return; // object is being dragged
            if (this.yield) {
                return;
            }


        //    console.log("[engine] block=" + this.thread.thisblock);


            if (this.thread.thisblock == null) {
                this.endCase();
                this.yield = true;
            } else {
                this.runPrim();
            }
        }
    }

    addRunScript (spr, b) {
        this.restartThread(spr, b);
    }

    stopThreads () {
        for (var i in this.threadsRunning) {
            this.threadsRunning[i].stop();
        }
        this.threadsRunning = [];
    }

    stopThreadBlock (b) {
        for (var i in this.threadsRunning) {
            if (this.threadsRunning[i].firstBlock == b) {
                this.threadsRunning[i].stop();
            }
        }
    }

    stopThreadSprite (spr) {
        for (var i in this.threadsRunning) {
            if (this.threadsRunning[i].spr == spr) {
                this.threadsRunning[i].stop();
            }
        }
    }

    removeRunScript (spr) {
        var res = [];
        for (var i in this.threadsRunning) {
            if (this.threadsRunning[i].spr == spr) {
                if (this.threadsRunning[i].isRunning) {
                    if (this.threadsRunning[i].thisblock != null) {
                        this.threadsRunning[i].endPrim();
                    }
                    res.push(this.threadsRunning[i].duplicate());
                }
                this.threadsRunning[i].isRunning = false;
                if (this.threadsRunning[i].oldblock != null) {
                    this.threadsRunning[i].oldblock.unhighlight();
                }
            }
        }
        return res;
    }

    runPrim () {
        if (this.thread.oldblock != null) {
            this.thread.oldblock.unhighlight();
          //  console.log("unhighlight");
          //  console.log(this.thread.oldblock.blocktype);
        }
        this.thread.oldblock = null;

        var token = Prims.table[this.thread.thisblock.blocktype];

        var robot_blocks = ['robot_forward','robot_back','robot_left','robot_right'];
        //console.log("[engine] token=" + token);

        //this.thread.robot_version = 0;
        if ((( (this.thread.robot_version == undefined)) || (this.thread.robot_version == -1)) && (robot_blocks.indexOf(this.thread.thisblock.blocktype) >= 0) && (!isTablet)){
            token = Prims.table.missing;
          //  alert("Не возможно определить версию робота. Пропускаем блок.");
        }
        if (token == null) {
            token = Prims.table.missing;
        } else {
            var noh = ['repeat', 'gotopage'];
            if (noh.indexOf(this.thread.thisblock.blocktype) < 0) {
                this.thread.thisblock.highlight();
            //    console.log("highlight");
                console.log("[engine] block type=" + this.thread.thisblock.blocktype);
                if (this.thread.thisblock.can_execute){
                     this.thread.oldblock = this.thread.thisblock;
                     Prims.time = (new Date() - 0);

                     console.log("[engine] let's run function1");
                     token(this.thread);
                }

            }
            else{
               Prims.time = (new Date() - 0);
               //  if (this.thread.oldblock != this.thread.thisblock)
               console.log("[engine] let's run function2");
               token(this.thread);
            }
        }
    }

    endCase () {
        if (this.thread.oldblock != null) {
            this.thread.oldblock.unhighlight();
        }
        if (this.thread.stack.length == 0) {
            Prims.Done(this.thread);
        } else {
            var thing = (this.thread.stack).pop();
            this.thread.thisblock = thing;
            this.runPrim();
        }
    }

    restartThread (spr, b, active) {
        var newThread = new Thread(spr, b);
        var wasRunning = false;
        for (var i = 0; i < this.threadsRunning.length; i++) {
            if (this.threadsRunning[i].firstBlock == b) {
                wasRunning = true;
                if (b.blocktype != 'ontouch') { // on touch demons are special - they are not interruptable
                    if (this.threadsRunning[i].oldblock != null) {

                        this.threadsRunning[i].oldblock.unhighlight();
                    }
                    this.threadsRunning[i].stopping(active);
                    newThread = this.threadsRunning[i];
                }
            }
        }
        if (!wasRunning) {


            this.robot_version = undefined;
            this.start_robot_version_checking_process = false;
            this.threadsRunning.push(newThread);
          //  this.get_robot_version_and_tickTask(this);


        }
        return newThread;
    }
}
