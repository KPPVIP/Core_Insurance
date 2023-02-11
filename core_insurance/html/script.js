var vehicles;
var plans;
var claiming;
var cooldowns = [];
var vehicleClaiming = null;
var usingCredits = false;
var CanInsureNotStored = true

function closeMenu() {
  $.post('https://core_insurance/close', JSON.stringify({}));


  $("#main_container").fadeOut(400);
  timeout = setTimeout(function () {
    $("#main_container").html("");
    $("#main_container").fadeIn();
  }, 400);


}

$(document).keyup(function (e) {
  if (e.keyCode === 27) {

    closeMenu();

  }

});

function choosePlan(k, plan) {

  $.post('https://core_insurance/changePlan', JSON.stringify({
    vehicle: vehicles[k],
    plan: plan
  }));
  closeMenu();


}

function openPlans(k) {

  $("#main_container").html('');

  var base = '<div class="slide-right" id="plans">';


  for (const [key, value] of Object.entries(plans)) {

    var claimTime = (value.claimTime / 60);
    if (claimTime < 1) {
      claimTime = value.claimTime + " SECONDS";
    } else {
      claimTime = claimTime + " MINUTES"
    }

    var cooldown = (value.cooldown / 60);
    if (cooldown < 1) {
      cooldown = value.cooldown + " SECONDS";
    } else {
      cooldown = cooldown + " MINUTES"
    }


    base = base + '   <div class="clearfix grpelem box" onclick="choosePlan(\'' + k + '\', \'' + key + '\')" id="pu804"><!-- group -->' +
      '    <div class="shadow gradient grpelem" id="u804"><!-- simple frame --></div>' +
      '    <div class="clearfix grpelem" id="u807-4"><!-- content -->' +
      '     <p>' + value.label + '</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u810-4"><!-- content -->' +
      '     <p>INSURANCE</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u813-4"><!-- content -->' +
      '     <p>CLAIM WAIT TIME</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u816-4"><!-- content -->' +
      '     <p>' + claimTime + '</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u819-4"><!-- content -->' +
      '     <p>INITIAL PAY</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u820-4"><!-- content -->' +
      '     <p>' + value.oneTimePrice + '$</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u831-4"><!-- content -->' +
      '     <p>HOURLY PAY</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u832-4"><!-- content -->' +
      '     <p>' + value.intervalPrice + '$</p>' +
      '    </div>' +
      '    <div class="grpelem" id="u984"><!-- simple frame --></div>' +
      '    <div class="clearfix grpelem" id="u990-4"><!-- content -->' +
      '     <p>FRANSCHISE</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u991-4"><!-- content -->' +
      '     <p>' + value.franchise + '$</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u996-4"><!-- content -->' +
      '     <p>COOLDOWN</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u997-4"><!-- content -->' +
      '     <p>' + cooldown + '</p>' +
      '    </div>' +
      '    <div class="clearfix grpelem" id="u1048-4"><!-- content -->' +
      '     <p>INSURE</p>' +
      '    </div>' +
      '   </div>';

  }


  '</div>';

  $("#main_container").append(base);
  $(".box").mouseover(function () {
    playClickSound();
  });
}


function claim(k, type) {

  $("#vehMenu").remove();


  $.post('https://core_insurance/claim', JSON.stringify({
    vehicle: vehicles[k],
    type: type
  }));

}

function openVehicleInsureInfo(k, op) {

  if (op < 1) {
    return;
  }

  var claimTime;
  var intervalPrice;
  var franchise;
  var cooldown;

  if (!plans[vehicles[k].insurance]) {
    claimTime = '-';
    intervalPrice = '-';
    franchise = '-';
    cooldown = '-';
  } else {
    claimTime = (plans[vehicles[k].insurance].claimTime / 60);
    intervalPrice = plans[vehicles[k].insurance].intervalPrice;
    franchise = plans[vehicles[k].insurance].franchise;
    cooldown = (plans[vehicles[k].insurance].cooldown / 60);


    if (claimTime < 1) {
      claimTime = plans[vehicles[k].insurance].claimTime + " SECONDS";
    } else {
      claimTime = claimTime + " MINUTES"
    }

    if (cooldown < 1) {
      cooldown = plans[vehicles[k].insurance].cooldown + " SECONDS";
    } else {
      cooldown = cooldown + " MINUTES"
    }

  }


  $("#vehMenu").remove();

  var base = '   <div class="clearfix grpelem  slide-right" id="vehMenu"><!-- group -->' +
    '    <div class="shadow gradient grpelem" id="u1042"><!-- simple frame --></div>' +
    '    <div class="clearfix grpelem" id="u1054-4"><!-- content -->' +
    '     <p><span id="u1054">' + vehicles[k].label.toUpperCase() + '</span></p>' +
    '    </div>' +
    '    <div class="grpelem" style=" background: url(' + vehicles[k].picture + ') no-repeat center center;background-size:80%;" id="u1057"><!-- simple frame --></div>' +
    '    <div class="clearfix grpelem" id="u1060-4"><!-- content -->' +
    '     <p>' + vehicles[k].name.toUpperCase() + '</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1063-4"><!-- content -->' +
    '     <p>CLAIM WAIT TIME</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1064-4"><!-- content -->' +
    '     <p>' + claimTime + '</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1069-4"><!-- content -->' +
    '     <p>HOURLY PAY</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1070-4"><!-- content -->' +
    '     <p>' + intervalPrice + '$</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1075-4"><!-- content -->' +
    '     <p>FRANSCHISE</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1076-4"><!-- content -->' +
    '     <p>' + franchise + '$</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1081-4"><!-- content -->' +
    '     <p>COOLDOWN</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1082-4"><!-- content -->' +
    '     <p>' + cooldown + '</p>' +
    '    </div>' +
    '    <div class="grpelem ripple" onclick="openPlans(\'' + k + '\')" id="u1087"><!-- simple frame -->' +
    '    <div class="clearfix grpelem" id="u1088-4"><!-- content -->' +
    '     <p>CHANGE PLAN</p>' +
    '    </div></div>' +
    '    <div class="grpelem"  id="u1093"><!-- simple frame --></div>' +
    '   </div>';

  $("#main_container").append(base);

}


function openVehicleMenu(k) {

  if (vehicles[k].opacity < 1 || $("#pu707-4").find('#' + vehicles[k].plate.replace(/ /g,"_")).find("#u789").css('display') != 'none') {
    return;
  }

  $("#vehMenu").remove();

  var claimTime = (plans[vehicles[k].insurance].claimTime / 60);
  if (claimTime < 1) {
    claimTime = plans[vehicles[k].insurance].claimTime + " SECONDS";
  } else {
    claimTime = claimTime + " MINUTES"
  }

  var cooldown = (plans[vehicles[k].insurance].cooldown / 60);
  if (cooldown < 1) {
    cooldown = plans[vehicles[k].insurance].cooldown + " SECONDS";
  } else {
    cooldown = cooldown + " MINUTES"
  }

  var base = '   <div class="clearfix grpelem  slide-right" id="vehMenu"><!-- group -->' +
    '    <div class="shadow gradient grpelem" id="u1042"><!-- simple frame --></div>' +
    '    <div class="clearfix grpelem" id="u1054-4"><!-- content -->' +
    '     <p><span id="u1054">' + vehicles[k].label.toUpperCase() + '</span></p>' +
    '    </div>' +
    '    <div class="grpelem" style=" background: url(' + vehicles[k].picture + ') no-repeat center center;background-size:80%;" id="u1057"><!-- simple frame --></div>' +
    '    <div class="clearfix grpelem" id="u1060-4"><!-- content -->' +
    '     <p>' + vehicles[k].name.toUpperCase() + '</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1063-4"><!-- content -->' +
    '     <p>CLAIM WAIT TIME</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1064-4"><!-- content -->' +
    '     <p>' + claimTime + '</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1069-4"><!-- content -->' +
    '     <p>HOURLY PAY</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1070-4"><!-- content -->' +
    '     <p>' + plans[vehicles[k].insurance].intervalPrice + '$</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1075-4"><!-- content -->' +
    '     <p>FRANSCHISE</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1076-4"><!-- content -->' +
    '     <p>' + plans[vehicles[k].insurance].franchise + '$</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1081-4"><!-- content -->' +
    '     <p>COOLDOWN</p>' +
    '    </div>' +
    '    <div class="clearfix grpelem" id="u1082-4"><!-- content -->' +
    '     <p>' + cooldown + '</p>' +
    '    </div>' +
    '    <div class="grpelem ripple" onclick="claim(\'' + k + '\', \'standard\')" id="u1087"><!-- simple frame -->' +
    '    <div class="clearfix grpelem" id="u1088-4"><!-- content -->' +
    '     <p>CLAIM FOR ' + plans[vehicles[k].insurance].franchise + '$</p>' +
    '    </div></div>';
  if (usingCredits) {
    base = base + '    <div class="grpelem ripple" onclick="claim(\'' + k + '\', \'instant\')" id="u1089"><!-- simple frame -->' +
      '    <div class="clearfix grpelem" id="u1088-5"><!-- content -->' +
      '     <p>CLAIM FOR ' + plans[vehicles[k].insurance].claimCreditsPrice + '</p>' +
      '    </div><div style=" background: #1368ad url(img/creditcoin.png) no-repeat center center;background-size:60%;" id="credits"></div></div>';
  }

  base = base + '    <div class="grpelem"  id="u1093"><!-- simple frame --></div>' +
    '   </div>';

  $("#main_container").append(base);

}

function openInsure() {

  $("#main_container").html('');

  var base = '<div class="clearfix slide-right" id="page"><!-- group -->' +
    '    <div class="clearfix colelem" id="u707-4"><!-- content -->' +
    '     <p>INSURANCE</p>' +
    '    </div>' +
    '   <div class="clearfix grpelem" id="pu707-4"><!-- column -->';


  for (const [key, value] of Object.entries(vehicles)) {

    var opacity = 1.0;
    if (vehicleClaiming != null) {
      if (value.plate == vehicleClaiming.plate) {

        opacity = 0.6;
      }
    }

    if (!CanInsureNotStored) {
      if (value.stored != 1) {
        opacity = 0.6;
      }
    }

    base = base + '    <div class="clearfix colelem box entry2" style="opacity: ' + opacity + ';"  onclick="openVehicleInsureInfo(\'' + key + '\', \'' + opacity + '\')" id="' + value.plate.replace(/ /g,"_") + '-insure"><!-- group -->' +
      '     <div class="shadow gradient grpelem" id="u786"><!-- simple frame --></div>' +
      '     <div class="clearfix grpelem" id="u787-5"><!-- content -->' +
      '      <p><span id="u787">' + value.label.toUpperCase() + ' </span>' + value.name.toUpperCase() + '</p>' +
      '     </div>' +
      '     <div class="clearfix grpelem" id="u788-4"><!-- content -->' +
      '      <p>' + value.plate.toUpperCase() + '</p>' +
      '     </div>' +
      '     <div class="grpelem scale-up-hor-right" id="u789"><!-- simple frame -->' +
      '     <div class="clearfix grpelem" id="u790-4"><!-- content -->' +
      '      <p>00:05</p>' +
      '     </div></div>' +


      '     <div class="grpelem" style=" background: url(' + value.picture + ') no-repeat center center;background-size:80%;" id="u791"><!-- simple frame --></div>' +
      '    </div>';


  }


  '   </div>' +


  '  </div>';

  $("#main_container").append(base);


}

function openClaims() {

  $("#main_container").html('');

  var base = '<div class="clearfix slide-right" id="page"><!-- group -->' +
    '    <div class="clearfix colelem" id="u707-4"><!-- content -->' +
    '     <p>INSURANCE</p>' +
    '    </div>' +
    '   <div class="clearfix grpelem" id="pu707-4"><!-- column -->';


  for (const [key, value] of Object.entries(vehicles)) {

    if (plans[value.insurance]) {

      if (vehicleClaiming) {
        if (vehicleClaiming.plate != value.plate) {
          value.opacity = 0.4;
        }
      }

      if (value.displayCooldown > 0) {
        cooldowns[value.plate] = value.displayCooldown;
      }


      base = base + '    <div class="clearfix colelem box entry" style="opacity: ' + value.opacity + ';" onclick="openVehicleMenu(\'' + key + '\')" id="' + value.plate.replace(/ /g,"_") + '"><!-- group -->' +
        '     <div class="shadow gradient grpelem" id="u786"><!-- simple frame --></div>' +
        '     <div class="clearfix grpelem" id="u787-5"><!-- content -->' +
        '      <p><span id="u787">' + value.label.toUpperCase() + ' </span>' + value.name.toUpperCase() + '</p>' +
        '     </div>' +
        '     <div class="clearfix grpelem" id="u788-4"><!-- content -->' +
        '      <p>' + value.plate.toUpperCase() + '</p>' +
        '     </div>';


      base = base + '     <div class="grpelem scale-up-hor-right" id="u789"><!-- simple frame -->' +
        '     <div class="clearfix grpelem" id="u790-4"><!-- content -->' +
        '      <p>00:00</p>' +
        '     </div></div>';


      base = base + '     <div class="grpelem" style=" background: url(' + value.picture + ') no-repeat center center;background-size:80%;" id="u791"><!-- simple frame --></div>' +
        '    </div>';
    }


  }


  '   </div>' +


  '  </div>';

  $("#main_container").append(base);


}

function openInsurance() {

  $("#main_container").html('');

  var base = '<div class="clearfix slide-right" id="page"><!-- group -->' +

    '    <div class="clearfix colelem" id="u707-4"><!-- content -->' +
    '     <p>INSURANCE</p>' +
    '    </div>' +
    '   <div class="clearfix grpelem" id="pu707-4"><!-- column -->' +

    '    <div class="clearfix colelem box" onclick="openInsure()" id="pu915"><!-- group -->' +
    '     <div class="shadow gradient grpelem" id="u915"><!-- simple frame --></div>' +
    '     <div class="clearfix grpelem" id="u916-5"><!-- content -->' +
    '      <p><span id="u916">INSURE </span>YOUR VEHICLE</p>' +
    '     </div>' +
    '     <div class="grpelem fas fa-hands-helping" id="u917"></div>' +
    '    </div>' +
    '    <div class="clearfix colelem box" onclick="openClaims()" id="pu708"><!-- group -->' +
    '     <div class="shadow gradient grpelem" id="u708"><!-- simple frame --></div>' +
    '     <div class="clearfix grpelem" id="u709-5"><!-- content -->' +
    '      <p><span id="u709">CLAIM </span>YOUR VEHICLE</p>' +
    '     </div>' +
    '     <div class="grpelem fas fa-car" id="u909"></div>' +
    '    </div>' +

    '  </div>';

  $("#main_container").append(base);

  $(".box").mouseover(function () {
    playClickSound();
  });
}


function playClickSound() {
  var audio = document.getElementById("clickaudio");
  audio.volume = 0.05;
  audio.play();
}


window.addEventListener('message', function (event) {


  var edata = event.data;

  if (edata.type == "tick") {
    for (const [key, value] of Object.entries(cooldowns)) {

      if (cooldowns[key] > 0) {
        var date = new Date(0);


        date.setSeconds(parseInt(value - 1));
        cooldowns[key] = cooldowns[key] - 1;


        var timeString = date.toISOString().substr(14, 5);

        var cd = $("#pu707-4").find('#' + key).find("#u789");
        cd.css('display', 'block');
        cd.css("background-color", "#209ffa");
        cd.find("#u790-4").text(timeString);

        if (cooldowns[key] == 0) {
          cd.css('display', 'none');
          cd.css("background-color", "#ff3636");

        }


      }
    }
  }

  if (edata.type == "claim") {

    claiming = $("#pu707-4").find('#' + edata.vehicle.plate.replace(/ /g,"_")).find("#u789");

    if (claiming) {
      if (edata.time <= 0) {
        claiming.css('display', 'none');
      } else {

        claiming.css('display', 'block');

        $(".entry").css("opacity", "0.6");
        $("#" + edata.vehicle.plate.replace(/ /g,"_")).css("opacity", "1.0")

        for (const [key, value] of Object.entries(vehicles)) {
          value.opacity = 0.4;
        }

        var date = new Date(0);
        date.setSeconds(parseInt(edata.time));
        var timeString = date.toISOString().substr(14, 5);

        claiming.find("#u790-4").text(timeString);

        if (edata.time == 1) {

          closeMenu();
        }
      }
    }


  }

  if (edata.type == "open") {

    vehicles = edata.vehicles;
    plans = edata.plans;
    vehicleClaiming = edata.claiming;
    cooldowns = [];
    usingCredits = edata.usingCredits;
    CanInsureNotStored = edata.CanInsureNotStored;
    openInsurance();


  }


});