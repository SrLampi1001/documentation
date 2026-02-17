# Level one
## overview
Fundamentals, basic database exploration  
The following are DQL (Data Query Comamands):
### Important
All instructions are based on a unique database context.
## Contents
|objective|SQL|result|description|
|----|-----|-------|----|
|list all users|```SELECT * FROM users;```|![all_users](../assets/placeholder.jpg)|The command selects all avaiable data inside a table or entity called "users"|
|show only first_name, last_name and email|```SELECT u.first_name, u.last_name, u.email FROM users u;```|![name_last_email_users](../assets/placeholder.jpg)|The command creates an alias for user "u", then, selects individually all the attributes first_name, last_name and email from the entity users|
|Filter users with "admin" role|```SELECT * FROM users WHERE role = 'admin';```|![admin_users](../assets/placeholder.jpg)|The command selects all the data from the users entity where the condition role = 'admin' is met|
|Filter users with document_type 'CC'|```SELECT * FROM users WHERE document_type = 'CC';```|![cc_users](../assets/placeholder.jpg)|The command selects all the data from the users entity where the condition document_type = 'CC' is met|
|show over 18 years old users|```SELECT * FROM users WHERE birth_date < '2008-01-01';```|![18y_users](../assets/placeholder.jpg)|The command selects all the data from the users entity where 2006-01-01 is greater than birth_date, this only work if the current year is 2026, else, the condition does not fullfill the objective|
|show users with over 5'000.000 revenue|```SELECT * FROM users WHERE monthly_income > '5000000';```|![5million_users](../assets/placeholder.jpg)|The command selects all the data from the users entity where monthly_income is greater than 5'000.000|
|Show users whose name start with 'a'|```SELECT * FROM users WHERE first_name LIKE 'a%';```|![a_start_users](../assets/placeholder.jpg)|The command uses "%" to indicate any number and type of chars, as it is present after "a", "a%", selects all users where first_name has an "a" as first char|
|Show users with no company |```SELECT * FROM users WHERE company IS NULL;```|![no_company_users](../assets/placeholder.jpg)|The command selects all data from entity users where company is null, if the logic for a user with no company were different, then the query won't work as expected|
