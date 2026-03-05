# User Story | StreamHub database
----
## Overview
### Riwi Assignment
This project is an assignment from the module 4, week 3 from Riwi.
### Description
A MongoDB application created for a fictitious organization called StreamHub, working on architecting a structured, scalable, stable NoSQL environment for querying CRUD operations and basic indexing for performance.
### **Status**: Incomplete 
### **Language**: English
----
Of course! This is a fantastic exercise to get hands-on with MongoDB. Let's break down the entire problem, step by step, so you have a clear roadmap to build your own solution.

### Introduction: What Are You Being Asked To Do?

The overall goal of this assignment is to simulate the backend data layer for a streaming service, which they've called "StreamHub." You are being asked to act as a database developer and architect. Your job isn't just to write queries, but to think about how data should be structured, stored, and retrieved efficiently in a NoSQL environment like MongoDB.

This task covers the full lifecycle of interacting with a database:
1.  **Design:** Planning what your data will look like.
2.  **Creation:** Putting that data into the database.
3.  **Reading:** Finding specific pieces of information using powerful filters.
4.  **Updating & Deleting:** Modifying or removing data as needed.
5.  **Optimization:** Making your database fast by creating indexes.

It's a comprehensive test of your understanding of core MongoDB concepts.

---

### Good Practices to Keep in Mind

Before diving into the commands, here are some guiding principles that will help you create a robust solution:

*   **Think in Documents, Not Tables:** Unlike SQL, MongoDB stores data in flexible, JSON-like documents. Embrace this. It's often better to embed related data (like a user's watch history) directly inside the user document rather than splitting it across multiple collections. This makes reading data faster.
*   **Plan Your Queries First:** Before you design your document structure, think about the questions you'll need to ask the database (e.g., "Find all movies longer than 120 minutes"). Your document design should make these common queries efficient.
*   **Use Meaningful Field Names:** Instead of `d` for duration, use `durationMinutes`. It makes your code and queries much more readable.
*   **Indexing is Key for Performance:** An index is like the index at the back of a book. Without it, MongoDB has to scan every single page (document) to find what you're looking for. With an index, it can jump straight to the right section. You'll be creating indexes on fields you query frequently.

---

### Step-by-Step Breakdown of the Tasks

Let's go through each task and identify the core concepts and MongoDB commands you'll need.

#### Task 1: Domain Analysis and Document Design

**What they are asking:**
This is the planning phase. You need to decide what "collections" (similar to tables in SQL) you need for StreamHub. The prompt suggests `users`, `movies`, `series`, `ratings`, and `lists`. Then, for each collection, you must define the structure of a sample document in JSON format.

**How to approach it:**
*   **Identify Collections:** Think about the main entities in a streaming service. Users, content (movies/series), and ratings are obvious. Do you need a separate collection for "watchlists"? Or can that be an array embedded in the user document?
*   **Define Document Structure:** For each collection, sketch out a sample document.
    *   **Users:** Might have `username`, `email`, `passwordHash`, and an embedded array called `watchHistory` containing movie IDs and dates watched.
    *   **Movies:** Could have `title`, `genre`, `durationMinutes`, `releaseYear`, and an embedded array of `reviews`.
    *   **Ratings:** Might link a `userId` to a `contentId` (movie or series) and store the `score`.

This step is crucial because the structure you design here will determine how you write all the subsequent queries.

#### Task 2: Data Insertion

**What they are asking:**
Once you have your design, you need to populate your collections with initial data. They want you to use both `insertOne()` for single documents and `insertMany()` for adding multiple documents at once. They also suggest creating varied data, like movies that already have reviews or users with a pre-filled watch history.

**Commands to Use:**
*   `db.collection.insertOne({ ... })`
*   `db.collection.insertMany([ { ... }, { ... } ])`

**Overview and Examples:**

*   **`insertOne()`**: This command adds a single new document to a specified collection. If the collection doesn't exist, MongoDB will create it for you.
    ```javascript
    // Example: Adding a single new user to the 'users' collection
    db.users.insertOne({
      username: "johndoe",
      email: "john.doe@example.com",
      watchHistory: [
        { contentId: "movie_101", watchedAt: new Date("2024-07-20") }
      ]
    });
    ```

*   **`insertMany()`**: This is more efficient for adding multiple documents in a single operation. You pass it an array of documents.
    ```javascript
    // Example: Adding several movies to the 'movies' collection
    db.movies.insertMany([
      {
        title: "Inception",
        genre: "Sci-Fi",
        durationMinutes: 148,
        releaseYear: 2010
      },
      {
        title: "The Godfather",
        genre: "Crime",
        durationMinutes: 175,
        releaseYear: 1972
      }
    ]);
    ```
*Your job is to create similar commands for your designed collections, making sure to include nested data like reviews or watch histories.*

#### Task 3: Queries (Reading) with Operators

**What they are asking:**
This is where you retrieve data from your collections using the `find()` command. The key here is to use MongoDB's rich set of query operators to filter the results. They specifically mention `$gt`, `$lt`, `$eq`, `$in`, `$and`, `$or`, and `$regex`.

**Command to Use:**
*   `db.collection.find({ <query_filter> })`

**Overview and Examples:**
The `find()` command takes a filter document. You specify the field and the condition you want to match.

*   **Comparison Operators (`$gt`, `$lt`, `$eq`):** These stand for "greater than," "less than," and "equal to."
    ```javascript
    // Find movies with a duration GREATER THAN 120 minutes ($gt)
    db.movies.find({ durationMinutes: { $gt: 120 } });

    // Find users who have watched FEWER THAN 5 items in their history ($lt)
    // Note: This requires checking the size of an array, which might need a different approach
    ```

*   **Logical Operators (`$and`, `$or`):** These allow you to combine multiple conditions.
    ```javascript
    // Find Sci-Fi movies released AFTER 2010 ($and)
    db.movies.find({
      $and: [
        { genre: "Sci-Fi" },
        { releaseYear: { $gt: 2010 } }
      ]
    });
    // This can also be written more simply as:
    db.movies.find({ genre: "Sci-Fi", releaseYear: { $gt: 2010 } });
    ```

*   **Array Operator (`$in`):** Checks if a field's value matches any value in a specified array.
    ```javascript
    // Find movies whose genre is either 'Action' or 'Adventure' ($in)
    db.movies.find({ genre: { $in: ["Action", "Adventure"] } });
    ```

*   **Regular Expression Operator (`$regex`):** Allows for powerful pattern matching on strings.
    ```javascript
    // Find all movies whose title STARTS with "The" ($regex)
    db.movies.find({ title: { $regex: "^The" } });
    ```
*You will need to construct `find()` queries using these operators to answer the specific questions posed in the task, like finding users who have watched more than 5 items.*

#### Task 4: Updates and Deletions

**What they are asking:**
Now you need to modify existing data and remove data. You'll use `updateOne`/`updateMany` for modifications and `deleteOne`/`deleteMany` for removals.

**Commands to Use:**
*   `db.collection.updateOne({ <filter> }, { <update> })`
*   `db.collection.deleteOne({ <filter> })`

**Overview and Examples:**

*   **`updateOne()`**: Finds the *first* document that matches the filter and applies the update. The second argument uses special "update operators" like `$set`, `$inc`, `$push`.
    ```javascript
    // Example: Update the rating of a specific movie ($set)
    db.movies.updateOne(
      { title: "Inception" }, // Filter: find this movie
      { $set: { averageRating: 4.8 } } // Update: set this field
    );

    // Example: Add a new review to a movie's review array ($push)
    db.movies.updateOne(
      { title: "Inception" },
      { $push: { reviews: { user: "alice", comment: "Mind-bending!" } } }
    );
    ```

*   **`deleteOne()`**: Finds the *first* document that matches the filter and removes it from the collection.
    ```javascript
    // Example: Delete a user by their username
    db.users.deleteOne({ username: "olduser" });
    ```
*Your task is to write similar commands to perform the updates and deletions described, such as updating a content's rating.*

#### Task 5: Indexes for Performance

**What they are asking:**
This task is about optimization. After you've created your collections and run some queries, you need to make those queries faster. You do this by creating indexes on fields that are frequently used in your `find()` filters (like `title` or `genre`). You also need to verify that the indexes were created correctly.

**Commands to Use:**
*   `db.collection.createIndex({ <field>: <order> })`
*   `db.collection.getIndexes()`

**Overview and Examples:**

*   **`createIndex()`**: This command tells MongoDB to build an index on a specific field. The order `1` means ascending, `-1` means descending. For simple lookups, `1` is standard.
    ```javascript
    // Example: Create an ascending index on the 'genre' field of the 'movies' collection
    db.movies.createIndex({ genre: 1 });

    // Example: Create a compound index on both 'genre' and 'releaseYear'
    // This is very efficient for queries that filter by both fields.
    db.movies.createIndex({ genre: 1, releaseYear: -1 });
    ```

*   **`getIndexes()`**: This command lists all the indexes that currently exist on a collection. Every collection automatically has an index on its `_id` field.
    ```javascript
    // Example: See all indexes on the 'movies' collection
    db.movies.getIndexes();
    /*
    Output might look like:
    [
      { v: 2, key: { _id: 1 }, name: "_id_" },
      { v: 2, key: { genre: 1 }, name: "genre_1" }
    ]
    */
    ```
*For this task, you should identify which fields from your queries in Task 3 would benefit from an index, create them, and then use `getIndexes()` to confirm they are there.*

By following this guide, you should have a solid understanding of what each part of the assignment requires and the specific tools (MongoDB commands) you need to use to complete it. Good luck
