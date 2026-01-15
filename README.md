# Straw Poll

[![Netlify Status](https://api.netlify.com/api/v1/badges/8cb2dc2e-11d4-43ce-aaa1-7aa460456fba/deploy-status)](https://app.netlify.com/projects/graceful-beijinho-cc80b0/deploys)

A simple website that lets users run strawpolls and share them with voters.

Limits 1 vote per IP address.

## Supabase

`npx supabase init`
`npx supabase start`
`npx supabase db reset` - runs all migrations

Production
`npx supabase link --project-ref cblgxzwsvtkzgskcybdw`
`npx supabase db push`
`npx supabase db pull`

## Database Setup
https://supabase.com/docs/guides/local-development/declarative-database-schemas
`supabase/schemas/` contains the desired declared state for database.

You must generate a migration file for those declarative schemas

`npx supabase db diff -f create_employees_table`
-f is the name of the migration file that will be generated


`npx supabase gen types typescript --local > database.types.ts`
`npx supabase db reset --link` reset the linked production supabase database

create poll with title and options pre-typed out
<http://localhost:5173/?title=What%20is%20your%20favourite%20movie?&options=Waking%20Life%20(2001),Fury%20(2014),Nightcrawler%20(2014),Before%20Sunrise%20(1995)>

open poll and hover the option in query params. 1 indexed.
<http://localhost:5173/6?option=1>

## Netlify
Copy production .env to the project
Get it by on supabase click connect. then select app frameworks React, Vite and copy the .env contents

## TODO
database
- enable row level security for all tables
- ensure all options for a poll must have unique text values.
- make realtime work with deletes, inserts, updates
- manage the rolls and ensure no users can do unexpected things

security
- make the anon key not get built into the bundle by netlify

production
- github actions to publish the vite project to netlify?

functionality
- synchronize the url with the form?
- target the create poll button if a title and >=2 options are supplied from query params
- add optiona description and image to a poll.
- add a button to go to a random poll
- when viewing results or voting, let any DB updates modify that page. for example if a option is removed or edited.
- make a fancy media preview for nicer link sharing in apps like discord or facebook or google search results
- when loading query params with html encoded chars like %20 and question marks, decode that before using on the webpage. (%253F decoded to %3F?)

looks
- styling
- css variables
- linting
- handle inputs that will wrap multiple lines
- add throbber for loading, use basic css rotation
    - throttle local development so you can see what a slow load looks like
- display errors nicely
- replace loading text, with a rolling gradient for the fields that are loading, emulate the look of the final webpage?
- show which option the user voted for (help show it was actually recorded)
- grow textarea vertically as needed. no scrollbar. hide resize dragging corner.
- ensure percents total to 100% when handling the rounding.
- when there are >= 10 options, the option number has inconsistent width. make this static so alignment stays valid
- when loading new votes, keep the bar at the starting position and make the changes to its position in a different shade?
- make the results the same height as the voting page. so the back to poll and results links are in the same screen position
- add a simple dark mode that uses system defaults, add a little button to toggle
- maybe even a color selection that can be customized by the user
- hide tooltip when hovering a required form input

ui
- let users rearrange their options when making a poll to change the order shown on the voting page.
- accessibility testing
- add different languages
- replace automatically adding next option input with a button to add options, keep in same place so you can easily spam it a few times
- let user paste their poll and options. one line per title and option
- on voting page, let keyboard keys select the option number. ex: pressing 3 will select option 3 radio button

tests
- add front end tests
- add backend tests
- add integration tests
- add status badges to readme
