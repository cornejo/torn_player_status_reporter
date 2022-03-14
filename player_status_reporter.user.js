// ==UserScript==
// @name         Player Status Reporter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Reports current player state to a central server
// @author       rDacted[2670953]
// @match        https://www.torn.com/profiles.php*
// @grant        GM_xmlhttpRequest
// @connect      torn.rocks
// @connect      *
// ==/UserScript==

let server = "https://torn.rocks/api/player_state";

function report(player_id, status, desc) {
    console.log("Player " + player_id + " has status " + status);
    let data = JSON.stringify({
        "player_id": player_id,
        "status": status,
        "desc": desc,
    });
    // console.log(data);
    let r = GM_xmlhttpRequest({
        method: "POST",
        url: server,
        data: data,
        nocache: true,
        revalidate: true,
        fetch: false,
        headers: {
            "Content-Type": "application/json",
        },
        onabort: function(response) { console.log("onabort " + response.responseText); },
        onerror: function(response) { console.log("onerror"); },
        onload: function(response) { console.log("onload " + response.responseText); },
        // onprogress: function(response) { console.log("onprogress " + response.responseText); },
        // onreadystatechange: function(response) { console.log("onreadystatechange " + response.responseText); },
        ontimeout: function(response) { console.log("ontimeout " + response.responseText); },
    });
    console.log(r);
}

function get_description(target) {
    let desc = target.getElementsByClassName('main-desc');
    if(desc.length > 0) {
        console.log(desc);
        return desc[0].textContent;
    }
    return "";
}

function set_player_state(player_id, target) {
    let desc = get_description(target);
    let classes = target.classList;
    let options = ["hospital", "okay", "jail", "travelling"];
    let found = false;
    for(const status of options) {
        if(classes.contains(status)) {
            report(player_id, status, desc);
            found = true;
        }
    }
    if(found == false) {
        report(player_id, "" + classes, desc);
    }
}

function start_observer() {
    let player_id = window.location.search.match(/\d+/);
    if(player_id != null) {
        player_id = player_id[0];
        console.log("Player ID " + player_id);

        // Select the target node
        let target = document.getElementsByClassName('profile-status');
        if(target.length > 0) {
            target = target[0]

            // Damnit. The player state starts off 'okay' regardless of their actual state
            // it then gets updated later - hence reporting it early is not worth it
            // set_player_state(player_id, target);

            // Create an observer instance
            let observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    set_player_state(player_id, mutation.target);
                });
            });

            // Configuration of the observer:
            var config = { attributes: true, childList: false, characterData: false };

            // Pass in the target node, as well as the observer options
            observer.observe(target, config);
        } else {
            console.log("Target not found");
        }
    }
}

(function() {
    'use strict';

    start_observer();
})();

