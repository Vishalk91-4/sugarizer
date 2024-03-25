// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
var app = new Vue({
	el: '#app',
	data: {
		displayText: ''
	},
	methods: {
		initialized: function () {
			// Sugarizer initialized
			var environment = this.$refs.SugarActivity.getEnvironment();
			this.displayText = "Hello " + environment.user.name + "!";	
		}
	}
});
