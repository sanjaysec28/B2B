export interface DBMSGlossaryItem {
  number: number;
  topic: string;
  englishDefinition: string;
  englishExplanation: string;
  tamilDefinition: string;
  tamilExplanation: string;
}

export const DBMS_GLOSSARY_TOPICS: DBMSGlossaryItem[] = [
  {
    "number": 1,
    "topic": "DBMS",
    "englishDefinition": "DBMS is software used to create, store, manage, and retrieve data from a database.",
    "englishExplanation": "It provides an interface between users/applications and the database.",
    "tamilDefinition": "DBMS-ன்னா database-ல் இருக்கும் data-வை create, store, manage, retrieve பண்ண use ஆகுற software.",
    "tamilExplanation": "இது users/applications-க்கும் database-க்கும் நடுவில் interface-ஆ work ஆகும்."
  },
  {
    "number": 2,
    "topic": "Database",
    "englishDefinition": "A database is an organized collection of related data.",
    "englishExplanation": "It stores data systematically so that it can be easily accessed and managed.",
    "tamilDefinition": "Database-ன்னா related data-வை organized-ஆ store பண்ணுற collection.",
    "tamilExplanation": "Data-வை systematic-ஆ store பண்ணுறதுனால easy-ஆ access மற்றும் manage பண்ண முடியும்."
  },
  {
    "number": 3,
    "topic": "RDBMS",
    "englishDefinition": "RDBMS is a database management system that stores data in tables.",
    "englishExplanation": "Tables are connected using relationships based on keys.",
    "tamilDefinition": "RDBMS-ன்னா data-வை tables form-ல store பண்ணுற Database Management System.",
    "tamilExplanation": "Tables-ஐ keys use பண்ணி relationships மூலமா connect பண்ணலாம்."
  },
  {
    "number": 4,
    "topic": "Table",
    "englishDefinition": "A table is a collection of data arranged in rows and columns.",
    "englishExplanation": "Rows represent records, while columns represent attributes.",
    "tamilDefinition": "Table-ன்னா data-வை rows and columns-ல organize பண்ணி store பண்ணுற structure.",
    "tamilExplanation": "Rows records-ஐ represent பண்ணும்; columns attributes-ஐ represent பண்ணும்."
  },
  {
    "number": 5,
    "topic": "Tuple",
    "englishDefinition": "A tuple is a single row in a relational table.",
    "englishExplanation": "It represents one complete record of an entity.",
    "tamilDefinition": "Tuple-ன்னா relational table-ல் இருக்கும் ஒரு single row.",
    "tamilExplanation": "ஒரு entity-யோட complete record-ஐ tuple represent பண்ணும்."
  },
  {
    "number": 6,
    "topic": "Attribute",
    "englishDefinition": "An attribute is a property or characteristic of an entity.",
    "englishExplanation": "In a table, an attribute is represented by a column.",
    "tamilDefinition": "Attribute-ன்னா ஒரு entity-யோட property அல்லது characteristic.",
    "tamilExplanation": "Table-ல attribute ஒரு column-ஆ represent ஆகும்."
  },
  {
    "number": 7,
    "topic": "Primary Key",
    "englishDefinition": "A primary key uniquely identifies each record in a table.",
    "englishExplanation": "It cannot contain duplicate or NULL values.",
    "tamilDefinition": "Primary Key-ன்னா table-ல ஒவ்வொரு record-ஐயும் uniquely identify பண்ண use ஆகுற key.",
    "tamilExplanation": "இதுல duplicate values-உம் NULL values-உம் இருக்கக் கூடாது."
  },
  {
    "number": 8,
    "topic": "Foreign Key",
    "englishDefinition": "A foreign key is an attribute that references a key in another table.",
    "englishExplanation": "It is mainly used to establish relationships between tables.",
    "tamilDefinition": "Foreign Key-ன்னா இன்னொரு table-ஓட key-ஐ reference பண்ணுற attribute.",
    "tamilExplanation": "இது mainly இரண்டு tables-க்கு relationship establish பண்ண use ஆகும்."
  },
  {
    "number": 9,
    "topic": "Candidate Key",
    "englishDefinition": "A candidate key is an attribute or set of attributes that can uniquely identify a record.",
    "englishExplanation": "One candidate key is selected as the primary key.",
    "tamilDefinition": "Candidate Key-ன்னா ஒரு record-ஐ uniquely identify பண்ண முடிகிற attribute அல்லது attributes set.",
    "tamilExplanation": "Candidate Keys-ல ஒரு key-ஐ Primary Key-ஆ select பண்ணுவாங்க."
  },
  {
    "number": 10,
    "topic": "Super Key",
    "englishDefinition": "A super key is a set of attributes that uniquely identifies a record.",
    "englishExplanation": "It may contain additional attributes that are not necessary for uniqueness.",
    "tamilDefinition": "Super Key-ன்னா ஒரு record-ஐ uniquely identify பண்ண முடிகிற attributes set.",
    "tamilExplanation": "Unique identification-க்கு தேவையில்லாத extra attributes-உம் இதுல இருக்கலாம்."
  },
  {
    "number": 11,
    "topic": "Alternate Key",
    "englishDefinition": "An alternate key is a candidate key that is not selected as the primary key.",
    "englishExplanation": "It can still uniquely identify records.",
    "tamilDefinition": "Alternate Key-ன்னா Primary Key-ஆ select பண்ணப்படாத Candidate Key.",
    "tamilExplanation": "இதுவும் records-ஐ uniquely identify பண்ண முடியும்."
  },
  {
    "number": 12,
    "topic": "Composite Key",
    "englishDefinition": "A composite key is a key made up of two or more attributes.",
    "englishExplanation": "Multiple columns together uniquely identify a record.",
    "tamilDefinition": "Composite Key-ன்னா two or more attributes சேர்ந்து form ஆகுற key.",
    "tamilExplanation": "Multiple columns-ஐ together use பண்ணி ஒரு record-ஐ uniquely identify பண்ணும்."
  },
  {
    "number": 13,
    "topic": "Unique Key",
    "englishDefinition": "A unique key ensures that values in a column are not duplicated.",
    "englishExplanation": "It maintains uniqueness among records.",
    "tamilDefinition": "Unique Key-ன்னா ஒரு column-ல duplicate values வராம ensure பண்ணுற constraint.",
    "tamilExplanation": "இது table-ல values unique-ஆ இருக்க help பண்ணும்."
  },
  {
    "number": 14,
    "topic": "NULL Value",
    "englishDefinition": "NULL represents a missing, unknown, or unavailable value.",
    "englishExplanation": "NULL is different from zero, an empty string, or a blank space.",
    "tamilDefinition": "NULL-ன்னா missing, unknown அல்லது available இல்லாத value-ஐ represent பண்ணும்.",
    "tamilExplanation": "NULL என்பது zero-வும் empty string-உம் கிடையாது; இதுக்கு different meaning இருக்கு."
  },
  {
    "number": 15,
    "topic": "Entity",
    "englishDefinition": "An entity is a real-world object about which data is stored.",
    "englishExplanation": "Examples include a student, employee, product, or department.",
    "tamilDefinition": "Entity-ன்னா real-world-ல இருக்கும் ஒரு object; அதோட data database-ல store பண்ணுவோம்.",
    "tamilExplanation": "Examples: Student, Employee, Product, Department."
  },
  {
    "number": 16,
    "topic": "Entity Set",
    "englishDefinition": "An entity set is a collection of similar entities.",
    "englishExplanation": "For example, all students in a college form a student entity set.",
    "tamilDefinition": "Entity Set-ன்னா same type-ஓட multiple entities-ஓட collection.",
    "tamilExplanation": "Example: College-ல இருக்கும் எல்லா students-உம் சேர்ந்து Student Entity Set ஆகும்."
  },
  {
    "number": 17,
    "topic": "ER Diagram",
    "englishDefinition": "An ER diagram is a graphical representation of entities, attributes, and relationships.",
    "englishExplanation": "It is used to design the structure of a database.",
    "tamilDefinition": "ER Diagram-ன்னா entities, attributes, relationships-ஐ graphical-ஆ represent பண்ணுற diagram.",
    "tamilExplanation": "Database structure-ஐ design பண்ண இது use ஆகும்."
  },
  {
    "number": 18,
    "topic": "Relationship",
    "englishDefinition": "A relationship represents an association between entities.",
    "englishExplanation": "For example, a student can enroll in a course.",
    "tamilDefinition": "Relationship-ன்னா two or more entities-க்கு இடையில இருக்கும் association.",
    "tamilExplanation": "Example: Student ஒரு Course-ஐ enroll பண்ணிருக்கலாம்."
  },
  {
    "number": 19,
    "topic": "Cardinality",
    "englishDefinition": "Cardinality defines the number of entities that can participate in a relationship.",
    "englishExplanation": "Common types are 1:1, 1:N, and M:N.",
    "tamilDefinition": "Cardinality-ன்னா ஒரு relationship-ல எவ்வளவு entities participate பண்ண முடியும்-னு define பண்ணும்.",
    "tamilExplanation": "Common types: 1:1, 1:N, M:N."
  },
  {
    "number": 20,
    "topic": "Normalization",
    "englishDefinition": "Normalization is the process of organizing data to reduce redundancy.",
    "englishExplanation": "It divides data into related tables to improve consistency.",
    "tamilDefinition": "Normalization-ன்னா data redundancy-ஐ reduce பண்ண database data-வை organize பண்ணுற process.",
    "tamilExplanation": "Data-வை related tables-ஆ divide பண்ணி consistency improve பண்ணும்."
  },
  {
    "number": 21,
    "topic": "First Normal Form (1NF)",
    "englishDefinition": "1NF requires every attribute to contain atomic values.",
    "englishExplanation": "Each cell must contain a single value without repeating groups.",
    "tamilDefinition": "1NF-ன்னா every attribute-உம் atomic அல்லது single value contain பண்ணணும்.",
    "tamilExplanation": "ஒரு cell-ல multiple values இல்லாம single value மட்டும் இருக்கணும்."
  },
  {
    "number": 22,
    "topic": "Second Normal Form (2NF)",
    "englishDefinition": "2NF is a relation in 1NF with no partial dependency.",
    "englishExplanation": "Every non-key attribute must depend on the entire primary key.",
    "tamilDefinition": "2NF-ன்னா table 1NF-ல இருக்கணும் மற்றும் partial dependency இருக்கக் கூடாது.",
    "tamilExplanation": "Every non-key attribute-உம் complete Primary Key-ஐ depend பண்ணணும்."
  },
  {
    "number": 23,
    "topic": "Third Normal Form (3NF)",
    "englishDefinition": "3NF is a relation in 2NF with no transitive dependency.",
    "englishExplanation": "Non-key attributes should depend only on the primary key.",
    "tamilDefinition": "3NF-ன்னா table 2NF-ல இருக்கணும் மற்றும் transitive dependency இருக்கக் கூடாது.",
    "tamilExplanation": "Non-key attributes Primary Key-ஐ மட்டும் depend பண்ணணும்."
  },
  {
    "number": 24,
    "topic": "BCNF",
    "englishDefinition": "BCNF is a stronger version of Third Normal Form.",
    "englishExplanation": "Every determinant in the relation must be a candidate key.",
    "tamilDefinition": "BCNF-ன்னா 3NF-ஓட stronger version.",
    "tamilExplanation": "Relation-ல இருக்கும் every determinant-உம் Candidate Key-ஆ இருக்கணும்."
  },
  {
    "number": 25,
    "topic": "Denormalization",
    "englishDefinition": "Denormalization is the process of intentionally adding redundancy to a database.",
    "englishExplanation": "It is mainly used to improve query performance.",
    "tamilDefinition": "Denormalization-ன்னா database-ல intentional-ஆ redundancy add பண்ணுற process.",
    "tamilExplanation": "Main-ஆ query performance improve பண்ண use பண்ணுவாங்க."
  },
  {
    "number": 26,
    "topic": "SQL",
    "englishDefinition": "SQL stands for Structured Query Language and is used to communicate with relational databases.",
    "englishExplanation": "It is used to create, retrieve, modify, and manage data.",
    "tamilDefinition": "SQL-ன்னா Structured Query Language; relational database-ஓட communicate பண்ண use பண்ணுவோம்.",
    "tamilExplanation": "Data-வை create, retrieve, modify, manage பண்ண SQL commands use பண்ணுவோம்."
  },
  {
    "number": 27,
    "topic": "DDL",
    "englishDefinition": "DDL stands for Data Definition Language.",
    "englishExplanation": "It is used to define and modify database structures using commands such as CREATE, ALTER, and DROP.",
    "tamilDefinition": "DDL-ன்னா Data Definition Language.",
    "tamilExplanation": "Database structure-ஐ define அல்லது modify பண்ண CREATE, ALTER, DROP மாதிரி commands use பண்ணும்."
  },
  {
    "number": 28,
    "topic": "DML",
    "englishDefinition": "DML stands for Data Manipulation Language.",
    "englishExplanation": "It is used to manipulate data using commands such as INSERT, UPDATE, and DELETE.",
    "tamilDefinition": "DML-ன்னா Data Manipulation Language.",
    "tamilExplanation": "Database data-வை manipulate பண்ண INSERT, UPDATE, DELETE மாதிரி commands use பண்ணும்."
  },
  {
    "number": 29,
    "topic": "DCL",
    "englishDefinition": "DCL stands for Data Control Language.",
    "englishExplanation": "It manages database access permissions using commands such as GRANT and REVOKE.",
    "tamilDefinition": "DCL-ன்னா Data Control Language.",
    "tamilExplanation": "Database access permissions-ஐ manage பண்ண GRANT மற்றும் REVOKE மாதிரி commands use பண்ணும்."
  },
  {
    "number": 30,
    "topic": "TCL",
    "englishDefinition": "TCL stands for Transaction Control Language.",
    "englishExplanation": "It manages transactions using commands such as COMMIT, ROLLBACK, and SAVEPOINT.",
    "tamilDefinition": "TCL-ன்னா Transaction Control Language.",
    "tamilExplanation": "Transactions-ஐ manage பண்ண COMMIT, ROLLBACK, SAVEPOINT மாதிரி commands use பண்ணும்."
  },
  {
    "number": 31,
    "topic": "SELECT",
    "englishDefinition": "SELECT is an SQL command used to retrieve data from a database.",
    "englishExplanation": "It allows users to retrieve specific columns or records based on conditions.",
    "tamilDefinition": "SELECT-ன்னா database-ல இருந்து data retrieve பண்ண use ஆகுற SQL command.",
    "tamilExplanation": "Specific columns அல்லது conditions based-ஆ records retrieve பண்ணலாம்."
  },
  {
    "number": 32,
    "topic": "JOIN",
    "englishDefinition": "JOIN is an SQL operation used to combine data from multiple tables.",
    "englishExplanation": "Tables are joined using related columns.",
    "tamilDefinition": "JOIN-ன்னா multiple tables-ல இருக்கும் related data-வை combine பண்ண use ஆகுற SQL operation.",
    "tamilExplanation": "Related columns-ஐ base பண்ணி tables-ஐ join பண்ணுவோம்."
  },
  {
    "number": 33,
    "topic": "INNER JOIN",
    "englishDefinition": "INNER JOIN returns records that have matching values in both tables.",
    "englishExplanation": "Non-matching records are excluded from the result.",
    "tamilDefinition": "INNER JOIN-ன்னா இரண்டு tables-லயும் matching records-ஐ மட்டும் return பண்ணும்.",
    "tamilExplanation": "Match ஆகாத records result-ல include ஆகாது."
  },
  {
    "number": 34,
    "topic": "LEFT JOIN",
    "englishDefinition": "LEFT JOIN returns all records from the left table and matching records from the right table.",
    "englishExplanation": "Non-matching right-side values are represented as NULL.",
    "tamilDefinition": "LEFT JOIN-ன்னா left table-ஓட all records-உம், right table-ஓட matching records-உம் return பண்ணும்.",
    "tamilExplanation": "Right table-ல match இல்லனா NULL values வரும்."
  },
  {
    "number": 35,
    "topic": "RIGHT JOIN",
    "englishDefinition": "RIGHT JOIN returns all records from the right table and matching records from the left table.",
    "englishExplanation": "Non-matching left-side values are represented as NULL.",
    "tamilDefinition": "RIGHT JOIN-ன்னா right table-ஓட all records-உம், left table-ஓட matching records-உம் return பண்ணும்.",
    "tamilExplanation": "Left table-ல match இல்லனா NULL values வரும்."
  },
  {
    "number": 36,
    "topic": "FULL OUTER JOIN",
    "englishDefinition": "FULL OUTER JOIN returns matching and non-matching records from both tables.",
    "englishExplanation": "Missing values from either table are represented as NULL.",
    "tamilDefinition": "FULL OUTER JOIN-ன்னா இரண்டு tables-ஓட matching மற்றும் non-matching records-ஐ return பண்ணும்.",
    "tamilExplanation": "Match இல்லாத side-ல NULL values வரும்."
  },
  {
    "number": 37,
    "topic": "View",
    "englishDefinition": "A view is a virtual table created from an SQL query.",
    "englishExplanation": "It does not normally store the actual data separately and displays data from underlying tables.",
    "tamilDefinition": "View-ன்னா SQL query base பண்ணி create பண்ணுற virtual table.",
    "tamilExplanation": "Underlying tables-ல இருக்கும் data-வை query result form-ல display பண்ணும்."
  },
  {
    "number": 38,
    "topic": "Index",
    "englishDefinition": "An index is a database structure used to speed up data retrieval.",
    "englishExplanation": "It improves search performance but may require additional storage.",
    "tamilDefinition": "Index-ன்னா database-ல data retrieval speed-ஐ improve பண்ண use ஆகுற structure.",
    "tamilExplanation": "Search fast-ஆ ஆகும்; ஆனா additional storage தேவைப்படும்."
  },
  {
    "number": 39,
    "topic": "Transaction",
    "englishDefinition": "A transaction is a sequence of database operations treated as one logical unit.",
    "englishExplanation": "It either completes successfully or is rolled back according to transaction rules.",
    "tamilDefinition": "Transaction-ன்னா database operations-ஓட ஒரு logical unit.",
    "tamilExplanation": "Transaction successful-ஆ complete ஆகணும்; இல்லனா appropriate-ஆ rollback பண்ணலாம்."
  },
  {
    "number": 40,
    "topic": "ACID Properties",
    "englishDefinition": "ACID represents Atomicity, Consistency, Isolation, and Durability.",
    "englishExplanation": "These properties ensure reliable and correct transaction processing.",
    "tamilDefinition": "ACID-ன்னா Atomicity, Consistency, Isolation, Durability.",
    "tamilExplanation": "Reliable மற்றும் correct transaction processing-ஐ ensure பண்ண இந்த four properties use ஆகும்."
  },
  {
    "number": 41,
    "topic": "Atomicity",
    "englishDefinition": "Atomicity means a transaction is completely executed or not executed at all.",
    "englishExplanation": "If any operation fails, the entire transaction can be rolled back.",
    "tamilDefinition": "Atomicity-ன்னா transaction complete-ஆ execute ஆகணும் அல்லது execute ஆகாம இருக்கணும்.",
    "tamilExplanation": "ஒரு operation fail ஆனா entire transaction-ஐ rollback பண்ண முடியும்."
  },
  {
    "number": 42,
    "topic": "Consistency",
    "englishDefinition": "Consistency ensures that a transaction moves the database from one valid state to another.",
    "englishExplanation": "All defined database constraints must remain satisfied.",
    "tamilDefinition": "Consistency-ன்னா transaction database-ஐ ஒரு valid state-ல இருந்து இன்னொரு valid state-க்கு கொண்டு போகணும்.",
    "tamilExplanation": "Database constraints transaction-க்கு முன்னும் பின்னும் satisfy ஆகணும்."
  },
  {
    "number": 43,
    "topic": "Isolation",
    "englishDefinition": "Isolation ensures that concurrent transactions do not improperly interfere with each other.",
    "englishExplanation": "Intermediate changes of one transaction are controlled from affecting another transaction.",
    "tamilDefinition": "Isolation-ன்னா concurrent transactions one another-ஐ improper-ஆ affect பண்ணாம இருக்குற property.",
    "tamilExplanation": "ஒரு transaction-ஓட intermediate changes-ஐ மற்ற transactions direct-ஆ affect பண்ண முடியாது."
  },
  {
    "number": 44,
    "topic": "Durability",
    "englishDefinition": "Durability ensures that committed transaction changes are permanently stored.",
    "englishExplanation": "The changes remain available even after a system failure.",
    "tamilDefinition": "Durability-ன்னா committed transaction changes permanent-ஆ store ஆகுற property.",
    "tamilExplanation": "System failure வந்தாலும் committed changes retain ஆகும்."
  },
  {
    "number": 45,
    "topic": "Concurrency Control",
    "englishDefinition": "Concurrency control manages simultaneous database transactions.",
    "englishExplanation": "It prevents conflicts and maintains database consistency.",
    "tamilDefinition": "Concurrency Control-ன்னா multiple transactions same time-ல execute ஆகும்போது manage பண்ணுற process.",
    "tamilExplanation": "Conflicts-ஐ prevent பண்ணி database consistency-ஐ maintain பண்ணும்."
  },
  {
    "number": 46,
    "topic": "Deadlock",
    "englishDefinition": "Deadlock occurs when transactions wait indefinitely for resources held by each other.",
    "englishExplanation": "Neither transaction can continue until the deadlock is resolved.",
    "tamilDefinition": "Deadlock-ன்னா transactions one another hold பண்ணுற resources-க்காக indefinitely wait பண்ணுற situation.",
    "tamilExplanation": "Deadlock வந்தா transactions continue ஆகாம stuck ஆகிடும்."
  },
  {
    "number": 47,
    "topic": "Stored Procedure",
    "englishDefinition": "A stored procedure is a precompiled collection of SQL statements stored in the database.",
    "englishExplanation": "It can be executed repeatedly to perform a specific database operation.",
    "tamilDefinition": "Stored Procedure-ன்னா database-ல store பண்ணி வைக்கப்பட்ட precompiled SQL statements-ஓட collection.",
    "tamilExplanation": "Specific operation-ஐ repeated-ஆ execute பண்ண use பண்ணலாம்."
  },
  {
    "number": 48,
    "topic": "Trigger",
    "englishDefinition": "A trigger is a database operation that automatically executes when a specified event occurs.",
    "englishExplanation": "It can be activated by events such as INSERT, UPDATE, or DELETE.",
    "tamilDefinition": "Trigger-ன்னா specific database event நடக்கும்போது automatically execute ஆகுற database operation.",
    "tamilExplanation": "INSERT, UPDATE, DELETE மாதிரி events-க்கு trigger activate ஆகலாம்."
  },
  {
    "number": 49,
    "topic": "Cursor",
    "englishDefinition": "A cursor is a database mechanism used to process query results row by row.",
    "englishExplanation": "It is useful when individual rows need to be processed sequentially.",
    "tamilDefinition": "Cursor-ன்னா query result-ல rows-ஐ one by one process பண்ண use ஆகுற database mechanism.",
    "tamilExplanation": "Individual rows-ஐ sequential-ஆ process பண்ண இது useful-ஆ இருக்கும்."
  },
  {
    "number": 50,
    "topic": "Referential Integrity",
    "englishDefinition": "Referential integrity ensures that relationships between tables remain valid.",
    "englishExplanation": "A foreign-key value must refer to an existing valid record in the referenced table.",
    "tamilDefinition": "Referential Integrity-ன்னா tables-க்கு இடையில இருக்கும் relationships valid-ஆ maintain பண்ணுற rule.",
    "tamilExplanation": "Foreign Key value referenced table-ல இருக்கும் valid existing record-ஐ reference பண்ணணும்."
  }
];
