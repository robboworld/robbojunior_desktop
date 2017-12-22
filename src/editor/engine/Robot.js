import Prims from './Prims';
import {isAndroid,isTablet} from '../../utils/lib';

export default class Robot {

  static init(){

    Robot.robot = {};
    Robot.robot.power_left  = 0;
    Robot.robot.power_right = 0;
    Robot.robot.moving = false;

  }

  static robot_send_power_command(robot_version, left_speed, right_speed){

    let left_speed_hex_string = left_speed.toString(16);
    let right_speed_hex_string = right_speed.toString(16);


    if (!isTablet){



    let url = `http://127.0.0.1:9876/txt/def/${robot_version}/rob_power/${left_speed_hex_string}/${right_speed_hex_string}`;

  //  console.log("[Engine::Robot.js::robot_send_power_command::url1:] " + url);

     var xhr = new XMLHttpRequest();
     xhr.open('GET', url, true);

     xhr.onload = function(){
        if(this.status == 200){
           //  alert("sucess");
        }
        else{
           var error = new Error(this.statusText);
           error.code = this.status;
           alert("error:" + error);
        }
    };

    xhr.onerror = function() {
    //  alert("Network error");
    };

    xhr.send();

//    console.log("[Engine::Robot.js::robot_send_power_command::url2:] " + url);
  }else{




      var result = AndroidInterface.setMotorPower(left_speed,right_speed);
      //alert(result);
  }

    }


static robot_send_power_command_desktop(robot_version, left_speed, right_speed){

  return new Promise(function(resolve, reject) {
    let url = `http://127.0.0.1:9876/txt/def/${robot_version}/rob_power/${left_speed}/${right_speed}`;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function() {
    if (this.status == 200) {
       if (resolve)
            resolve(this.response);
       }
       else {
            var error = new Error(this.statusText);
            error.code = this.status;
            if (reject)
            reject(error);
       }
    };

    xhr.onerror = function() {
       reject(new Error("Network Error"));
    };

    xhr.send();

    console.log("[Engine::Robot.js::robot_send_power_command::url:] " + url);

  });
}



    /*** Robot Block start ***/
   static Robot_forward(strip){
      if(Robot.robot.moving) return;

      console.log("[engine] robot_forward=" + strip);
//      Robot.robot.moving = true;

        //    Robot.setTime(strip);

      console.log("[robbo_forward:]" + new Date());


      //strip.thisblock.can_execute = false;

     let power_in_percent;

    if (strip.robot_version != 3){
       power_in_percent = 30; //Мощность в процетах.
    }else{

         power_in_percent = 100; //Мощность в процетах.

    }
      let power = Math.round(power_in_percent * 0.63);

      Robot.robot.power_left = power;
      Robot.robot.power_right = power;

      var execution_time = Number(strip.thisblock.getArgValue()) * 1000 / 5;

      if (execution_time != 0){

      strip.waitTimer = execution_time;

      for(var j = 0; j < execution_time / 200 ; j++){
         setTimeout(function(){
          Robot.robot_send_power_command(strip.robot_version, Robot.robot.power_left, Robot.robot.power_right)
         }, 200 * j);
      }

      setTimeout(function(){
         console.log("[engine] nextBlock()");
         Robot.robot.moving = false;
         Robot.robot_send_power_command(strip.robot_version, "00", "00")
         Prims.DoNextBlock(strip);
      }, execution_time);

    }else{

         Prims.DoNextBlock(strip);

    }

//      Robot.DoNextBlock(strip);
   }



   static Robot_back(strip){
      if(Robot.robot.moving) return;
      console.log("[engine] robot_back=" + strip);
//      Robot.robot.moving = true;

      //strip.waitTimer = 10/*Math.round(Number(strip.thisblock.getArgValue()) * 1000 / 32 + 1)*/;

//      strip.thisblock.can_execute = false;

 let power_in_percent;

if (strip.robot_version != 3){
   power_in_percent = 30; //Мощность в процетах.
}else{

     power_in_percent = 100; //Мощность в процетах.

}
      let power = Math.round(power_in_percent * 0.63) + 64;

      Robot.robot.power_left = power;
      Robot.robot.power_right = power;

      var execution_time = Number(strip.thisblock.getArgValue()) * 1000 / 5;
      strip.waitTimer = execution_time;

      if (execution_time != 0){

      strip.waitTimer = execution_time;

      for(var j = 0; j < execution_time / 200 ; j++){
         setTimeout(function(){
          Robot.robot_send_power_command(strip.robot_version, Robot.robot.power_left, Robot.robot.power_right)
         }, 200 * j);
      }

      setTimeout(function(){
         console.log("[engine] nextBlock()");
         Robot.robot.moving = false;
         Robot.robot_send_power_command(strip.robot_version, "00", "00")
         Prims.DoNextBlock(strip);
      }, execution_time);

    }else{

         Prims.DoNextBlock(strip);

    }

//      Robot.DoNextBlock(strip);
   }


static Robot_left(strip){


      if(Robot.robot.moving) return;
      console.log("[engine] robot_left=" + strip);
  //      Robot.robot.moving = true;

      //strip.waitTimer = 10/*Math.round(Number(strip.thisblock.getArgValue()) * 1000 / 32 + 1)*/;

  //      strip.thisblock.can_execute = false;

  let power_in_percent;

 if (strip.robot_version != 3){
    power_in_percent = 30; //Мощность в процетах.
 }else{

      power_in_percent = 100; //Мощность в процетах.

 }
      let power = Math.round(power_in_percent * 0.63);

      Robot.robot.power_left = power + 64;
      Robot.robot.power_right = power;

      var execution_time = Number(strip.thisblock.getArgValue()) * 1000 / 5;

      if (execution_time != 0){

      strip.waitTimer = execution_time;

      for(var j = 0; j < execution_time / 200 ; j++){
         setTimeout(function(){
          Robot.robot_send_power_command(strip.robot_version, Robot.robot.power_left, Robot.robot.power_right)
         }, 200 * j);
      }

      setTimeout(function(){
         console.log("[engine] nextBlock()");
         Robot.robot.moving = false;
         Robot.robot_send_power_command(strip.robot_version, "00", "00")
         Prims.DoNextBlock(strip);
      }, execution_time);

    }else{

         Prims.DoNextBlock(strip);

    }
}
    static Robot_right(strip){

      if(Robot.robot.moving) return;
      console.log("[engine] robot_right=" + strip);
  //      Robot.robot.moving = true;

      //strip.waitTimer = 10/*Math.round(Number(strip.thisblock.getArgValue()) * 1000 / 32 + 1)*/;

  //      strip.thisblock.can_execute = false;

  let power_in_percent;

 if (strip.robot_version != 3){
    power_in_percent = 30; //Мощность в процетах.
 }else{

      power_in_percent = 100; //Мощность в процетах.

 }
      let power = Math.round(power_in_percent * 0.63);

      Robot.robot.power_left = power;
      Robot.robot.power_right = power + 64;

      var execution_time = Number(strip.thisblock.getArgValue()) * 1000 / 5;
      strip.waitTimer = execution_time;

      if (execution_time != 0){

      strip.waitTimer = execution_time;

      for(var j = 0; j < execution_time / 200 ; j++){
         setTimeout(function(){
          Robot.robot_send_power_command(strip.robot_version, Robot.robot.power_left, Robot.robot.power_right)
         }, 200 * j);
      }

      setTimeout(function(){
         console.log("[engine] nextBlock()");
         Robot.robot.moving = false;
         Robot.robot_send_power_command(strip.robot_version, "00", "00")
         Prims.DoNextBlock(strip);
      }, execution_time);

    }else{

         Prims.DoNextBlock(strip);

    }

    }

}
