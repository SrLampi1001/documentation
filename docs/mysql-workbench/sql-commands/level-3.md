# Level three
## overview
Fundamentals, Introduction to analysis
The following are DQL (Data Query Comamands):
### Important
All instructions are based on a unique database context.
## Contents
|objective|SQL|result|description|
|----|-----|-------|----|
|count users grouped by role|```SELECT role, COUNT(*) AS 'quantity' FROM users u GROUP BY role;```|![count_users_by_role](../assets/placeholder.jpg)|The command groups all records from the entity users by the role attribute and counts how many users exist for each role. The result displays each role along with the total number of users assigned to it.|
|count users grouped by document type|```SELECT document_type, COUNT(*) AS 'quantity' FROM users u GROUP BY u.document_type;```|![count_users_by_document_type](../assets/placeholder.jpg)|The command groups users by the document_type attribute and counts the number of records in each group. The result shows each document type and the corresponding quantity of users.|
|count unemployed users|```SELECT company, COUNT(*) AS 'quantity' FROM users u WHERE company IS NULL GROUP BY u.company;```|![count_unemployed_users](../assets/placeholder.jpg)|The command filters users whose company attribute is NULL (meaning they are unemployed) and groups the results by company. Since company is NULL for all filtered records, the query returns the total number of unemployed users.|
|calculate overall average monthly income|```SELECT AVG(u.monthly_income) AS 'average' FROM users u;```|![average_income_general](../assets/placeholder.jpg)|The command calculates the average value of the monthly_income attribute across all users in the entity. The result returns a single value representing the general average income.|
|calculate average monthly income grouped by role|```SELECT role, AVG(u.monthly_income) AS 'average' FROM users u GROUP BY u.role;```|![average_income_by_role](../assets/placeholder.jpg)|The command groups users by the role attribute and calculates the average monthly_income for each role. The result shows each role along with its corresponding average income.|
