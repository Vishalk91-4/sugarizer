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
	components: {
		'pawn': Pawn
	},
	data: {
		currentenv: null,
		SugarL10n: null,
		SugarPresence: null,
		displayText: '',
		pawns: [],
		l10n: {
			stringAddPawn: '',
		}
	},
	mounted: function () {
		this.SugarL10n = this.$refs.SugarL10n;
		this.SugarPresence = this.$refs.SugarPresence;
	},
	methods: {
		onJournalNewInstance: function() {
			console.log("New instance");
		},
		
		onJournalDataLoaded: function(data, metadata) {
			console.log("Existing instance");
			this.pawns = data.pawns;
		},
		onJournalSharedInstance: function() {
			console.log("Shared instance");
		},
		onJournalLoadError: function(error) {
			console.log("Error loading from journal");
		},
		onNetworkDataReceived(msg) {
			this.pawns.push(msg.content);
			this.displayText = this.SugarL10n.get("Played", { name: msg.user.name });
		},
		
		onNetworkUserChanged(msg) {
			// Handles the user-changed event
		},
		initialized: function () {
			// Sugarizer initialized
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
		},
		localized: function () {
			this.displayText = this.SugarL10n.get("Hello", { name: this.currentenv.user.name });
			this.SugarL10n.localize(this.l10n);
		},
		onAddClick: function () {
			this.pawns.push(this.currentenv.user.colorvalue);
			this.displayText = this.SugarL10n.get("Played", { name: this.currentenv.user.name });
			if (this.SugarPresence.isShared()) {
				var message = {
					user: this.SugarPresence.getUserInfo(),
					content: this.currentenv.user.colorvalue
				}
				this.SugarPresence.sendMessage(message);
			}		
		},
		onStop: function () {
			// Save current pawns in Journal on Stop
			var context = {
				pawns: this.pawns
			};
			this.$refs.SugarJournal.saveData(context);
		},
	}
	
});