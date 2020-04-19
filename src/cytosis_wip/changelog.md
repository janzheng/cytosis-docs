changelog.md


Quick Notes
- see how opts.tables plays with init
	- create example of how to init without using query / cytosis
		- this will speed up loading significantly
		- should use the same schema as the cols in `_cytosis`
		- 'config' is the object that holds everything in `configTableName`
- Open Questions
	- find example where getTables takes an object for tableNames, and create an example of this scenario
- need to update all array.push to array = [...array, newitem] — helps with reactivity
- getConfig needs to be rewritten, as well as save, patchUpdate, putUpdate, updateFields, replaceFields,, b/c of the new getBase system

- whoa I just found an undocumented fn - seems to return EVERYTHING w/o paging, but also without filtering or anything... it just gets every single thing from a table lol. Hmmmmm. Shoud do an airtableList that gets everything that way, maybe an airtableCount if it doesn't run into the max(100) issue
```
  let _items = []
  base(tableName).forEach((each) => {
    _items.push(each)
  }, (done) => {
    console.log('done?!!?!?!?', _items)
  })
```



- 4/19/2020
	- added save/load config caching into `initCytosis`

- 4/18/2020
	- added config localStore caching system

- 4/16/2020
	- `loadConfig` changed to `loadFromConfig` 
	- changed `init` to a static fn `initCytosis`
	- broke up original init into static functions to allow for reloading config and table data externally

- 4/15/2020
	- added `getPageTable` as a way to get paginated data; separate from Cytosis


- 4/14/2020
	- updated: original pagination code was in getTable but that proved a poor decision b/c it affected `_config` too
	- added `_this.lastUpdated` 
	- removed `_this.reset` — skip init by passing in a config object
	- removed the case where tableNames is an array of strings (normally this happens when you load a query w/o other linked queries) — simplified it so if there's only one table and option, it's wrapped in an object
	- ** note tableNames is retrieved twice w/ diff contexts, why? needs to be simplified, maybe make the apiKey + baseId explicit in this step — maybe tableNames is actually `bases` w/ diff keys and IDs so you can request from diff. bases?
	- added a timeout to airtableFetch/fetchNextPage's delay system; would otherwise make an erroneous fetchNextPage after no more data could be returned
	- moved Airtable configuration (apiKey and baseId) to getBase, which allows for a much more flexible config (multiple bases, etc.)
	- changed "cytosis.tableNames" to a "cytosis.bases", and each "base" allows for a different API key and baseID — also moved the new getBase into `getTablePromise` (and out of airtableFetch) — this alllows each getTablePromise to get from a different base, but each table retrieved won't keep hitting Airtable Auth
	- added cleanRecord to airtableFetch, meaning each record retrieved is sanitied of helper fns and lots of bloat
	- removed `getConfig` and instead added `cytosis.getConfigOnly` that stops init from getting the rest of the tables

- 4/13/2020
	- removed returning object and stopping init if not given a queryName — new thinking is that you only init when you want something from AT
	- airBase.tables is confusing, as it's both an input (which tables should Cytosis fetch from) and the returned table data itself
	- airBase.tables > changed to tableNames
	- cytosis.tables > changed to cytosis.results
	- configTableName is the new name for `_cytosis`
	- changed setup(...) to loadConfig(...)
	- cytosis.config > changed to configObject
	- airBase.options > changed to cytosis.tableOptions
	- merged payloads.keyword into options, as options.keyword
	- added cytosis.pageNumber and cytosis.pageDelay for paging implementation
	- added some pagination code; changed up fetching from Airtable. Updated data added directly to `cytosis.results`

- 4/12/2020
	- changed 'tableQuery' to 'configName'
	- got rid of the airBase object
	- moved configName out of "airBase" and right into the cytosis obj
	- removed the static configure function — the old plan was to set up many Airtable or data objects in Cytosis, but this isn't the case anymore

- 4/10/2020
	- removed "If constructing without arguments" — they're required
	- renamed airKey and airBase.id official Airtable naming for api ('apiKey') and base ('baseId')
	- removed 'opts.airBaseId' as a valid option for base key
	- moved a lot of configs out of 'airBase' into the base object for clarity
		- originally the idea was to store multiple bases in a Cytosis object, but for simplicity now you can only use one base in one Cytosis. A helper wrapper fn can be used to load up multiple bases w/ an array of Promises
	- added `apiEditorKey` that overrides regular `apiKey` and allows for saving, updating, and deleting records 







