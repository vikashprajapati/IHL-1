function signupWithFacebook(){
    FB.login(function(response) {
        if (response.authResponse) {
            // console.log('Welcome!  Fetching your information.... ');
            FB.api('/me?fields=id,name,email,picture', function(response) {
                document.getElementById('name').value=response.name;
                document.getElementById('profileurl').value=response.picture.data.url;
                document.getElementById('signUpEmail').value = response.email;
                console.log(response.picture.data.url);
            });
			document.getElementById("f1").value="true";
        }
		else {
            // console.log('User cancelled login or did not fully authorize.');
        }
    },{
        scope: 'public_profile, email'
    });
}

window.fbAsyncInit = function() {
FB.init({
    appId      : '245532369664721',
    cookie     : true,
    xfbml      : true,
    version    : 'v3.2'
});

FB.AppEvents.logPageView();

};
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function loginWithFacebook(){
    FB.login(function(response) {
        if (response.authResponse) {
            // console.log('Welcome!  Fetching your information.... ');
            FB.api('/me?fields=id,name,email', function(response) {
            // console.log('Good to see you, ' + response.name + '.');
                console.log(response);
                document.getElementById('loginmail').value = response.email;
            });
			document.getElementById("f2").value="true";
			lform=document.getElementById("loginform");
			lform.submit();
        }
		else {
            // console.log('User cancelled login or did not fully authorize.');
        }
    },{
        scope: 'public_profile, email,user_friends'
    });
}

window.fbAsyncInit = function() {
FB.init({
    appId      : '245532369664721',
    cookie     : true,
    xfbml      : true,
    version    : 'v3.2'
});

FB.AppEvents.logPageView();

};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
