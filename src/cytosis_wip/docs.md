







- 9/12/2018
  - made lots of functions static
  - added dynamic rows to init, can specify what row in _cytosis to pull from now
  - changed from .get() to .fields[] to get away from using the prototype
  - added getFieldValues
  - changed search() to comb through multiple list of strings
  - added getNames to get flat list of row names
  - started to add better comments on functions w/ input/output
  - changed key/base names to airKey and airBase
  - made get() synchronous
  - added linked column search to Find(), e.g. TableName.RecordName.ColName.LinkedColName
  - changed split / unsplit behavior to not affect user too much
    - user still has to save each new split field to Airtable
    - can now unsplit Airtable data and data will appear "normal"
  - changed the way getTables is accessed: takes a single object arg now
  - changed `_cytosis` column from 'Items' to 'Tables' -> will be severely breaking


- 2/17/2019
  - tableNames changed to tableQuery
  - added multiple querying — given a list of queries in LinkedQueryNames "_content, _tags", will pull data from both queries
  - added better support for views/formulas/filters

- 7/15/2019
  - added partial matching; set the single select field matchStyle to "partial" to partially match a keyword 
  - changed the poorly named "settings" attribute to "payloads" so it's less confusing between options and settings 

- 7/21/2019
  - added some experimental (nonfunctional) code for introspecting / finding empty fields
  - added a static cleanTable transformation function that takes a table and only keeps fields and id

- 8/14/2019
  - added setup() to compartmentalize initialization;
  - added a way to send a config object to bypass hitting airtable for _config so much
  - added airtableFetch to add throttling for fetching, but holding off

- 8/16/2019
  - added error for find/findOne fields not being an array

- 8/23/2019
  - added a delay to fetchnextpage to reduce hitting limits
  - added some better error output; testing silent error for fetch
  - added a "routeName" component, for routeName, tracing bugs etc.
  - added a helper method to just retrieve cytosis configs

- 8/26/2019
  - added getConfig to only get the `_cytosis` config data


- 8/27/2019
  - added findField as a finder/getter

- 8/30/2019
  - added strip, which retains fields, id, and core parts of a cytosis object
  - added a filter helper, 'filter_or'

- 8/31/2019
  - added getRecord that uses Airtable API's "find" method
  - added cleanRecord that only keeps id, fields, and some of `_table` from a record

- 9/1/2019
  - fixed save () and delete; saveLinkedTables probably needs a fixin' too

- 9/4/2019
  - added a typecast option to class and static save ()
  - added saveArray and reverted old save () to how it used to be; save Array uses the new API
  - update airtable dep to 0.7.1
  - also consider a real CHANGELOG.md lol

- 9/10/2019
  - added a condition in init when not sending a tableQuery (just want a base obj)

- 9/20/2019
  - added a simpler way of getting record ID by supplying a base object

















Cytosis CMS (cytosis)

  - Cytosis grabs and stores/caches data. Very useful for Airtable.
    - Turns Airtable-centric into a light static CMS like Contentful

  - Cytosis currently WRAPS THE Airtable API!
    - The Airtable API is kind of huge
    - future: localstorage and mLab/mongo/firebase
      - for offline access
      - for multiple devices

  - so in the future some of these should be separated
  - getLinkedRecords should be static






Future / roadmap

  - Build a vue plugin kind of like: https://github.com/vuejs/vuefire/tree/firestore
  - possible to do a last changed time stamp, and changed by who and ID number stored in _cytosis metadata
    - can do things like simple change tracking etc.
  - preload — specify which tables to load first, which to defer
    - load the content tables in first, and the massive data later
    - also can load contextual metadata (like what page is it, where to get resources, etc.)
  - static — specify which tables are static / won't change much
    - used for static page generation that speeds up page loads
  - cytosis controller table
    - can use this to variably set other table names w/o hard coding
  - front-end wrapper
    - jquery, non-vue getter
      - maybe extend jquery prototype?
      - maybe have another 'helper' class or set of functions that don't belong to regular Cytosis?
    - public API key
    - extensible version of the atlx experiment
  - keepAlive syncing / polling w/ Airtable (not fully reactive like Meteor 
    - but can sync+cache at 5 ticks/sec
    - webtask can sync/cache at 1 tick/sec
  - add fetch / delayed retrieval for some tables (also maybe in _cytosis as a separate row)
    - idea is we don't always want to grab everything from Airtable; some huge tables are better put off til needed
  - cytosis webtask (for public interfaces)
  - make easier to specify '_cytosis' or supply an array of data:{ [tableNames] }
  - clean up and unify schema
  - partial downloads: can set some to be deferred to be downloaded until needed (makes initial site load faster)
    - partial table downloads, e.g. for searching, so not as much data needs to be pulled
  - support prisma API / support partial downlaods from graphql
  - support firebase
  - 

Bugs

  - SaveLinkedTable, if save clicked multiple times, doesn't check for duplicates already added, so can potentially add several of the same tags
    - probably the source needs to refresh, not sure if cytosis could fix it
    - this has to be done:: (local needs to be refreshed) this.cytosis.tables.Tags = this.tags // refresh local tags store


Thoughts / Ideas / Notes / Done

  - using airtableobject.get('Name') doesn't always work, since sometimes the prototype doesn't get preserved
    - this is true w/ Nuxt 'Universal' (static) mode




"Docs"


- Getting Started - 

  Cytosis is for using Airtable as a prototype CMS
  Core user data is best not stored using this system. Use something like auth0 or firebase instead.

  Best for Public Content
    - Sometimes you want to display content from a CMS. Cytosis turns Airtable into one.
    - Create a separate user with view-only access, and use its API key as the cytosis API key
      - The key is used the exact same way as a regular key, except create/update/delete will throw errors 
    - Ex: Website content, blog content, news articles, lists or browsable data like bookmarks or store data

  For Private content, use sparingly
    - Passworded sites and local apps can hardcode the API key (airKey) directly in cytosis
    - KEEP IN MIND that cytosis code is visible in the code inspector. 
    - One way to guard against this is for users to enter their Airtable API key and Base ID manually
    - You can also use a serverless function as authentication, and provide the API and Base after authentication

  Private/Public Content
    - Any sites w/ functionality to update Airtable as well as read from Airtable for the masses
    - If there's a login system, you can create a handler that retrieves a user's private API key and load it into their system
      - the privateKeyHandler is just a convenient place to store the serverless URL that retrieves this data
    - Semi-private: Todo lists, shopping lists — apps that run on a public machine, but users have edit access to their own repo
      - Retrieve the private API key from a server or external system after login
    - Public-private: Feedback forms, rating systems, commenting systems, interactive projects — users can all edit the same data repository will require an external server handler
      - Use a public API for read, and process create/update/delete requests via an external handler

  // init Cytosis
  const cytosis = await new Cytosis({
    airKey: 'key value' — if used on front-end projects, make sure it's on a separate airtable account w/ read-only permissions!!
    airBase: {
      id: 'Airtable Base ID key', 
      tables: [array of table names]} — optional; otherwise looks for `_cytosis` table, w/ a column called Items w/ multiple select
  })

  You can also:

  1. Either set a default Base and Key for Cytosis object itself
  2. myCytosis = await new Cytosis({airKey: '123', airBase: '123'}) — defaults to looking for _cytosis table
  3. myCytosis = await new Cytosis({airKey: '123', airBase: '123', tables: ['table1','table2']}) — just reads/caches the given tables
  4. myCytosis = await new Cytosis({airKey: '123', airBase: '123', tableQuery: 'tableName'}) — tableName is the name of the table index row in _cytosis. You can add Items to the custom table name for dynamic loading
  4. myCytosis = await new Cytosis({airKey: '123', airBase: '123', tableQuery: 'tableName'}, {view: 'Grid View'}) — you can also specify an Airtable API options object w/ view, fields, sort, filter

  // Airtable options: filter is an Airtable filter formula https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference

  // Cytosis loads tables from `_cytosis` table instead of hard-coded
  // create a row w/ Name="tableNames" and a Multiple Select called 'Items' with the table names

  // After initialization, the myCytosis.tables will contain all loaded tables 

- Usage -

  cytosis.get('recordId')
  // returns a promise of data of a single record
  // useful when you have an array of recordIds

  cytosis.getTables(options={}, tables=this.airBase.tables)
  // returns a promise of data of a single record
  // {options} are: view, fields, sort, filter, per the Airtable API
  // [tables] is an array of table names (default is to retrieve whatever has been initiated)

  cytosis.save(object, tableName, recordId=undefined)
  // {object} is the object you want saved. Fields must match those of the table or not be defined
  // 'tableName' is the name of the table you're saving your object to
  // 'recordId' lets you update an existing record. Unfortunately you still have to supply the tableName per the API

  cytosis.delete(tableName, recordId)
  // 'tableName' is the name of the table to delete your object from. API requires you to state tableName
  // 'recordId' is the record to be deleted. 

- Helpers -

  cytosis.getLinkedRecords(recordIds, linkedTable, getObj=false)
  // airtable excels at creating links between records. These links are stored as arrays of recordIds
  // this converts the linked records to an array of Names (for Tags this is sufficient)
  // if you need the entire objects, set getObj to true
  // [recordIds] is an array of links (e.g. a list of tag references to the Tags table)
  // 'linkedTable' is the table name e.g. 'Tags' where the records are stored

  cytosis.split(saveObject, key, maxChunks=4)
  // this one splits huge objects (stringified > 100,000 chars) across multiple columns
  // e.g. an object to be stored in key `_data` gets split into `_data _data-1 _data-2`
  // the table needs to have those extra columns created in Airtable, so this requires some planning 
  // {saveObject} is the object you want to store
  // 'key' is something like `_data`

  cytosis.unsplit(record, key)
  // {record} is the actual record object from Airtable (not a record Id)
  // 'key' is the what you want to unsplit (e.g. `_data` from the above example)








