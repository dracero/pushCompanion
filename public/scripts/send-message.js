/* eslint-env  es6*/

function getDetails() {
  const details = window.localStorage.getItem('last-known-details');
  try {
    if (details) {
      return JSON.parse(details);
    }
  } catch (err) {
    // NOOP
  }
  return null;
}

function saveDetails(details) {
  window.localStorage.setItem('last-known-details',
    JSON.stringify(details));
}

function sendPushMessage(row) {
  
  const textToSendTextArea = document.querySelector('#push-data'); 
  const urlToSend = document.querySelector('#url-data'); 
  var i;
  
    console.log(row);
    const subscriptionString = row;
    const dataString = textToSendTextArea.value;
 
  saveDetails({
    subscription: subscriptionString,
    data: dataString
  });

  if (subscriptionString.length === 0 ) {
    return Promise.reject(new Error('Please provide a push subscription.'));
  }

  let subscriptionObject = null;
  try {
    subscriptionObject = JSON.parse(subscriptionString);
  } catch (err) {
    return Promise.reject(new Error('Unable to parse subscription as JSON'));
  }

  if (!subscriptionObject.endpoint) {
    return Promise.reject(new Error('The subscription MUST have an endpoint'));
  }

  if (subscriptionObject.endpoint.indexOf('…') !== -1) {
    return Promise.reject(new Error('The subscription endpoint appears to be ' +
      'truncated (It has \'...\' in it).\n\nDid you copy it from the console ' +
      'in Chrome?')
    );
  }
 return fetch('/api/send-push-msg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription: subscriptionObject,
      data: dataString+"$"+ urlToSend.value,
      applicationKeys: {
        public: 'BCGdB1k1Bnt3YIV_mYuAfpWlDFjcwg6va0fj_1VcP8SKLR4B_WYi6jGEC1xzYhiUCbUDEnWyj65Z4HEIV34mfiw',
        private: 'CV8vfQItcA722oiFpBOuuTwyTGpvjTmS4Sel8dq416I'
      }
    })
  })
  .then((response) => {
    if (response.status !== 200) {
      return response.text()
      .then((responseText) => {
        throw new Error(responseText);
      });
    }
  });
  
  
}

function initialiseUI() {
  const sendBtn = document.querySelector('.js-send-push');
  sendBtn.addEventListener('click', () => {
  sendBtn.disabled = true;
  read().then(function(result) {
  var key;
  var obj
  function tabRow() {
  return result.map(function(object, key) {
     return  obj={object};
    });
   }
 for(var i=0;i<tabRow().length;i++){              
    sendPushMessage(JSON.stringify(tabRow()[i].object.variable))
    .catch((err) => {
      console.error(err);
      window.alert(err.message);
    })
    .then(() => {
      sendBtn.disabled = true;
     });
    };
  });
 });
  
}

async function read (){
       let response = await axios.get("https://apibackpush.herokuapp.com/webpush/");
       return response.data;
    }

window.addEventListener('load', () => {
  initialiseUI();
});
