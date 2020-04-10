changelog.md


- 4/10/2020
	- removed "If constructing without arguments" — they're required
	- renamed airKey and airBase.id official Airtable naming for api ('apiKey') and base ('baseId')
	- removed 'opts.airBaseId' as a valid option for base key
	- moved a lot of configs out of 'airBase' into the base object for clarity
		- originally the idea was to store multiple bases in a Cytosis object, but for simplicity now you can only use one base in one Cytosis. A helper wrapper fn can be used to load up multiple bases w/ an array of Promises
	- added `apiEditorKey` that overrides regular `apiKey` and allows for saving, updating, and deleting records 