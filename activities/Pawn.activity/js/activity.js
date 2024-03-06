// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
const app = Vue.createApp({
	components: {
		"sugar-tutorial": SugarTutorial,
		"sugar-presence": SugarPresence,
		"sugar-localization": SugarLocalization,
		"sugar-journal": SugarJournal,
		"sugar-activity": SugarActivity,
		"sugar-toolbar": SugarToolbar,
		"sugar-toolitem": SugarToolitem,
		'pawn': Pawn
	},

	data: function () {
		return {
			currentenv: null,
			SugarL10n: null,
			SugarPresence: null,
			displayText: '',
			pawns: [],
			l10n: {
				stringAddPawn: '',
				stringTutoExplainTitle: '',
				stringTutoExplainContent: '',
				stringTutoAddTitle: '',
				stringTutoAddContent: '',
				stringTutoBackgroundTitle: '',
				stringTutoBackgroundContent: '',
			},
			SugarL10n: null,
		}
	},
	mounted: function () {
		this.SugarPresence = this.$refs.SugarPresence;
	},
	// Handles localized event
	created: function () {
		var vm = this;
		window.addEventListener(
			"localized",
			(e) => {
				// We Cannot use "vm.currentenv.user.name" here as activity might not be initialized.
				// For that you might want to store the SugarL10n in to the data(state of vue) and use computed values for it
				vm.SugarL10n = e.detail.l10n;
				vm.SugarL10n.localize(vm.l10n);
			},
			{ once: true },
		);
	},

	computed: {
		// Recomputes 'helloString' when SugarL10n or currentenv changes.
		helloString: function() {
			if (!this.SugarL10n || !this.currentenv) return "";
			return this.SugarL10n.get("Hello", { name: this.currentenv.user.name });
		},
	},
	methods: {
		initialized: function () {
			// Sugarizer initialized
			this.currentenv = this.$refs.SugarActivity.getEnvironment();
			this.displayText = this.SugarL10n.get("Hello", { name: this.currentenv.user.name });
		},
		onAddClick: function (event) {
			for (var i = 0; i < event.count; i++) {
				this.pawns.push(this.currentenv.user.colorvalue);
				this.displayText = this.SugarL10n.get("Played", { name: this.currentenv.user.name });
		
				if (this.SugarPresence.isShared()) {
					var message = {
						user: this.SugarPresence.getUserInfo(),
						content: {
							action: 'update',
							data: this.currentenv.user.colorvalue
						}
					}
					this.SugarPresence.sendMessage(message);
				}
			}
		},
		onStop: function () {
			// Save current pawns in Journal on Stop
			const context = {
				pawns: this.pawns
			};
			this.$refs.SugarJournal.saveData(context);
		},
		onJournalNewInstance: function() {
			console.log("New instance");
		},
		
		onJournalDataLoaded: function(data, metadata) {
			console.log("Existing instance");
			this.pawns = data.pawns;
		},
		
		onJournalLoadError: function(error) {
			console.log("Error loading from journal");
		},
		onJournalSharedInstance: function() {
			console.log("Shared instance");
		},
		onNetworkDataReceived: function(msg) {
			switch (msg.content.action) {
				case 'init':
					this.pawns = msg.content.data;
					break;
				case 'update':
					this.pawns.push(msg.content.data);
					this.displayText = this.SugarL10n.get("Played", { name: msg.user.name });
					break;
			}
		},
		onNetworkUserChanged: function(msg) {
			// Handling only by the host
			if (this.SugarPresence.isHost) {
				this.SugarPresence.sendMessage({
					user: this.SugarPresence.getUserInfo(),
					content: {
						action: 'init',
						data: this.pawns
					}
				});
			}
		},
		insertBackground: function () {
			var filters = [
				{ mimetype: 'image/png' }, 
				{ mimetype: 'image/jpeg' }
			];
			this.$refs.SugarJournal.insertFromJournal(filters)
				.then(function (data, metadata) {
					document.getElementById("app").style.backgroundImage = `url(${data})`;
				});
		},
		onHelp: function () {
			var steps = [
				{
					title: this.l10n.stringTutoExplainTitle,
					intro: this.l10n.stringTutoExplainContent
				},
				{
					element: "#add-button",
					position: "right",
					title: this.l10n.stringTutoAddTitle,
					intro: this.l10n.stringTutoAddContent
				},
				{
					element: "#insert-button",
					position: "bottom",
					title: this.l10n.stringTutoBackgroundTitle,
					intro: this.l10n.stringTutoBackgroundContent
				}
			];
			this.$refs.SugarTutorial.show(steps);
		},
	}
});

app.mount("#app");
