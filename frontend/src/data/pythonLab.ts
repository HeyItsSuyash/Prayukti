// Python Programming Lab — Experiment Data
// Source: VirtualCompiler (vcompilers/client/src/python-lab/data/pythonExperiments.js)
// Converted to TypeScript for PrayuktiVLab integration

import type { LabExperiment } from "./cLab";

export const pythonExperiments: LabExperiment[] = [
    {
        id: 1,
        title: "Simple Statements, Operators and Expressions",
        description: "Learn basic Python syntax using simple statements, variables, operators, and expressions.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement basic Python programs using simple statements, variables, operators, and expressions. Students will learn how Python executes instructions and performs calculations using different types of operators such as arithmetic, relational, and logical operators.",
        theory: "Python is a high-level, easy-to-learn programming language.\n\nA simple statement in Python is an instruction that the interpreter executes. Variables are used to store data values.\n\nTypes of operators in Python:\n- Arithmetic operators: +, -, *, /, %\n- Relational operators: ==, !=, >, <\n- Logical operators: and, or, not\n\nExpressions are combinations of variables, operators, and values that produce a result. Python executes statements line by line and produces output accordingly.",
        algorithm: [
            "Step 1: Start the program.",
            "Step 2: Declare variables and assign values.",
            "Step 3: Use arithmetic operators to perform calculations.",
            "Step 4: Store results in variables.",
            "Step 5: Use print statement to display output.",
            "Step 6: Execute the program.",
            "Step 7: Stop the program."
        ],
        procedure: [
            "Step 1: Open the Virtual Programming Lab.",
            "Step 2: Select Python Programming Lab.",
            "Step 3: Select Experiment 1: Simple Statements, Operators and Expressions.",
            "Step 4: Read the Aim and Theory of the experiment.",
            "Step 5: Observe the algorithm carefully.",
            "Step 6: Load the default Python code in the editor.",
            "Step 7: Click the Run button to execute the program.",
            "Step 8: Observe the output in the Console Output panel.",
            "Step 9: Verify the results.",
            "Step 10: Modify values and run again to understand better."
        ],
        result: "The program was successfully executed, and the results of arithmetic operations using simple Python statements, variables, and operators were displayed correctly.",
        conclusion: "From this experiment, we learned how to write basic Python programs using simple statements, variables, operators, and expressions.",
        defaultCode: `# Python program to demonstrate simple statements, operators, and expressions

# Declare variables
a = 10
b = 5

# Arithmetic operations
sum = a + b
difference = a - b
product = a * b
division = a / b

# Display results
print("Value of a =", a)
print("Value of b =", b)

print("Addition =", sum)
print("Subtraction =", difference)
print("Multiplication =", product)
print("Division =", division)`,
        language: "python"
    },
    {
        id: 2,
        title: "Writing codes using conditional statements",
        description: "Learn how to use conditional statements like if, if-else, and nested if to control program flow in Python.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement conditional statements in Python. Students will learn how to use if, if-else, and nested if statements to control the flow of execution.",
        theory: "Conditional statements are used to perform different actions based on different conditions.\n\nIn Python:\n- if statement executes a block only if the condition is true.\n- if-else executes one block if true and another if false.\n- if-elif-else handles multiple conditions.\n- Nested if means using an if statement inside another if statement.",
        algorithm: [
            "Step 1: Start the program.",
            "Step 2: Declare variables or take input.",
            "Step 3: Apply conditional statement (if condition).",
            "Step 4: Check whether the condition is true or false.",
            "Step 5: Execute appropriate block of code.",
            "Step 6: Display the result.",
            "Step 7: Stop the program."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Programming Lab.",
            "Step 3: Select Experiment 2: Conditional Statements.",
            "Step 4: Read the Aim and Theory carefully.",
            "Step 5: Study the algorithm.",
            "Step 6: Observe the default Python code.",
            "Step 7: Click Run button.",
            "Step 8: Observe output in output console.",
            "Step 9: Modify input values and run again.",
            "Step 10: Verify the results."
        ],
        result: "The program was successfully executed, and the conditional statements correctly evaluated the conditions and displayed the appropriate output based on the input value.",
        conclusion: "From this experiment, we learned how to use conditional statements such as if, if-else, and if-elif-else in Python. Conditional statements are essential for developing logical and decision-based programs.",
        defaultCode: `# Python program to demonstrate conditional statements

# Take input
num = int(input("Enter a number: "))

# Check even or odd
if num % 2 == 0:
    print("The number is Even")
else:
    print("The number is Odd")

# Check positive, negative, or zero
if num > 0:
    print("The number is Positive")
elif num < 0:
    print("The number is Negative")
else:
    print("The number is Zero")`,
        language: "python"
    },
    {
        id: 3,
        title: "Iterative Statements (Loops)",
        description: "Learn how to use loops such as for and while to execute statements repeatedly in Python.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement iterative statements (loops) in Python. Loops allow a set of instructions to be executed repeatedly based on a condition.",
        theory: "Iterative statements, also called loops, are used to execute a block of code repeatedly.\n\nPython provides two main types of loops:\n1. for loop — used when the number of iterations is known.\n2. while loop — used when the number of iterations depends on a condition.\n\nLoops help reduce code repetition and make programs efficient.",
        algorithm: [
            "Step 1: Start the program.",
            "Step 2: Initialize a variable.",
            "Step 3: Use for loop to repeat statements.",
            "Step 4: Use while loop with a condition.",
            "Step 5: Execute statements inside loop.",
            "Step 6: Increment or update loop variable.",
            "Step 7: Display output.",
            "Step 8: Stop the program."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Programming Lab.",
            "Step 3: Click Experiment 3: Iterative Statements.",
            "Step 4: Read Aim and Theory.",
            "Step 5: Study algorithm carefully.",
            "Step 6: Observe default code in editor.",
            "Step 7: Click Run button.",
            "Step 8: Observe output.",
            "Step 9: Modify values and run again.",
            "Step 10: Verify loop execution."
        ],
        result: "The program executed successfully, and the loops correctly repeated the statements and displayed the expected output.",
        conclusion: "From this experiment, we learned how to use iterative statements such as for loop and while loop in Python. Loops are essential for solving problems involving repetition and data processing.",
        defaultCode: `# Python program demonstrating loops

# For loop example
print("For Loop Output:")
for i in range(1, 6):
    print(i)

# While loop example
print("\\nWhile Loop Output:")
i = 1
while i <= 5:
    print(i)
    i += 1

# Sum using loop
sum = 0
for i in range(1, 6):
    sum += i

print("\\nSum of numbers from 1 to 5 is:", sum)`,
        language: "python"
    },
    {
        id: 4,
        title: "Arrays and Array Operations",
        description: "Learn how to create arrays (lists), access elements, and use array methods in Python.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand how to create arrays in Python and perform operations on them. Students will learn how to store multiple values in arrays (lists), access elements using indexing, iterate through array elements, and use built-in array methods.",
        theory: "An array is a collection of elements stored in a single variable. In Python, arrays are implemented using lists.\n\nLists can store multiple values of different data types.\n\nPython provides various list methods:\n- append() – adds element to list\n- remove() – removes element\n- pop() – removes last element\n- len() – returns length",
        algorithm: [
            "Step 1: Start the program.",
            "Step 2: Create an array (list).",
            "Step 3: Display array elements.",
            "Step 4: Add new element using append().",
            "Step 5: Remove element using remove().",
            "Step 6: Traverse array using loop.",
            "Step 7: Display updated array.",
            "Step 8: Stop the program."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Lab.",
            "Step 3: Click Experiment 4.",
            "Step 4: Read Aim and Theory.",
            "Step 5: Observe default code.",
            "Step 6: Click Run button.",
            "Step 7: Observe output.",
            "Step 8: Modify array values.",
            "Step 9: Run program again.",
            "Step 10: Verify array operations."
        ],
        result: "The program executed successfully, and array operations such as creation, insertion, deletion, and traversal were performed correctly.",
        conclusion: "From this experiment, we learned how to create arrays in Python and perform various operations such as accessing, inserting, and removing elements.",
        defaultCode: `# Python program demonstrating array operations

# Create array
arr = [10, 20, 30, 40]

print("Original Array:", arr)

# Access elements
print("First element:", arr[0])

# Add element
arr.append(50)
print("After append:", arr)

# Remove element
arr.remove(20)
print("After remove:", arr)

# Traverse array
print("Array elements:")
for i in arr:
    print(i)`,
        language: "python"
    },
    {
        id: 5,
        title: "Using Standard Python Modules",
        description: "Learn how to use standard Python modules such as math, random, and datetime.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand how to use standard Python modules. Modules provide predefined functions that help perform various operations such as mathematical calculations, random number generation, and date/time operations.",
        theory: "A module is a file containing Python functions and variables.\n\nPython provides many standard modules such as:\n- math module: provides mathematical functions like sqrt(), pow()\n- random module: generates random numbers with randint()\n- datetime module: provides date and time utilities\n\nModules make programming easier by providing reusable code.",
        algorithm: [
            "Step 1: Start program.",
            "Step 2: Import standard modules.",
            "Step 3: Use module functions.",
            "Step 4: Perform calculations.",
            "Step 5: Display results.",
            "Step 6: Stop program."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Lab.",
            "Step 3: Click Experiment 5.",
            "Step 4: Read Aim and Theory.",
            "Step 5: Observe default code.",
            "Step 6: Click Run button.",
            "Step 7: Observe output.",
            "Step 8: Modify values.",
            "Step 9: Run program again.",
            "Step 10: Verify module usage."
        ],
        result: "The program executed successfully, and standard Python modules were used to perform mathematical calculations, generate random numbers, and display date and time.",
        conclusion: "From this experiment, we learned how to use Python standard modules such as math, random, and datetime. Modules help simplify programming by providing useful built-in functions.",
        defaultCode: `# Python program demonstrating standard modules

import math
import random
import datetime

# Math module
print("Square root of 25:", math.sqrt(25))
print("Power 2^3:", math.pow(2,3))

# Random module
print("Random number:", random.randint(1,100))

# Datetime module
print("Current date and time:", datetime.datetime.now())`,
        language: "python"
    },
    {
        id: 6,
        title: "Functions and Recursion",
        description: "Learn how to create functions and implement recursion in Python.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand how to create functions in Python and implement recursion. Functions help organize code into reusable blocks, and recursion allows a function to call itself to solve problems such as factorial calculation.",
        theory: "A function is a block of code that performs a specific task.\n\nFunctions improve code reuse and readability.\n\nRecursion is when a function calls itself:\n- factorial(n) = n × factorial(n-1)\n- Base condition stops recursion.\n\nFunctions and recursion are important in problem solving, tree traversal, and algorithm design.",
        algorithm: [
            "Step 1: Start program.",
            "Step 2: Define function.",
            "Step 3: Take input.",
            "Step 4: Call function.",
            "Step 5: Apply recursion logic.",
            "Step 6: Display result.",
            "Step 7: Stop program."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Lab.",
            "Step 3: Select Experiment 6.",
            "Step 4: Read Aim and Theory.",
            "Step 5: Observe default code.",
            "Step 6: Click Run button.",
            "Step 7: Observe output.",
            "Step 8: Modify input.",
            "Step 9: Run again.",
            "Step 10: Verify result."
        ],
        result: "The program executed successfully, and the factorial was calculated using recursion.",
        conclusion: "From this experiment, we learned how to create functions and use recursion to solve problems efficiently.",
        defaultCode: `# Function and recursion example

def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

num = int(input("Enter number: "))
print("Factorial =", factorial(num))`,
        language: "python"
    },
    {
        id: 7,
        title: "Constructors and Destructors",
        description: "Managing object lifecycle in Object Oriented Programming.",
        difficulty: "Medium",
        objective: "To understand constructors and destructors in Python classes.",
        theory: "Constructor initializes object. __init__() is constructor.\n\nDestructor deletes object. __del__() is destructor.\n\nConstructor is called when object is created. Destructor is called when object is deleted or program ends.",
        algorithm: [
            "Step 1: Define class.",
            "Step 2: Define constructor.",
            "Step 3: Create object.",
            "Step 4: Execute constructor.",
            "Step 5: Delete object.",
            "Step 6: Execute destructor."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Lab.",
            "Step 3: Select Experiment 7.",
            "Step 4: Read Aim and Theory.",
            "Step 5: Observe default code.",
            "Step 6: Click Run button.",
            "Step 7: Observe output.",
            "Step 8: Verify constructor and destructor calls.",
            "Step 9: Modify class.",
            "Step 10: Run again."
        ],
        result: "Constructor and destructor executed successfully.",
        conclusion: "Learned object initialization and destruction.",
        defaultCode: `class Test:

    def __init__(self):
        print("Constructor called")

    def __del__(self):
        print("Destructor called")

obj = Test()
del obj`,
        language: "python"
    },
    {
        id: 8,
        title: "Object Oriented Programming: Inheritance",
        description: "Learn how to implement inheritance in Python to reuse code from parent class.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement inheritance in Python. Inheritance allows one class to acquire properties and methods of another class.",
        theory: "Inheritance is an important concept in Object-Oriented Programming (OOP).\n\nInheritance allows one class (child class) to inherit properties and methods from another class (parent class).\n\nSyntax:\nclass Parent:\n    pass\n\nclass Child(Parent):\n    pass\n\nAdvantages: Code reuse, improves efficiency, reduces redundancy.",
        algorithm: [
            "Step 1: Start the program.",
            "Step 2: Define Parent class.",
            "Step 3: Define Child class inheriting Parent class.",
            "Step 4: Create object of Child class.",
            "Step 5: Call inherited method.",
            "Step 6: Display output.",
            "Step 7: Stop the program."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Programming Lab.",
            "Step 3: Select Experiment 8.",
            "Step 4: Read Aim and Theory.",
            "Step 5: Observe default code.",
            "Step 6: Click Run button.",
            "Step 7: Observe output.",
            "Step 8: Verify inherited method works.",
            "Step 9: Modify code and run again.",
            "Step 10: Observe changes."
        ],
        result: "The program executed successfully, and the child class inherited and used the parent class method.",
        conclusion: "From this experiment, we learned how inheritance works in Python. Inheritance helps improve code reuse and program efficiency.",
        defaultCode: `# Python program demonstrating inheritance

class Parent:
    def show(self):
        print("This is Parent class method")

class Child(Parent):
    def display(self):
        print("This is Child class method")

obj = Child()

obj.show()
obj.display()`,
        language: "python"
    },
    {
        id: 9,
        title: "Object Oriented Programming: Polymorphism",
        description: "Learn how polymorphism allows objects to use same method with different behavior.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand polymorphism in Python. Polymorphism allows the same method name to behave differently for different objects.",
        theory: "Polymorphism means many forms.\n\nIn Python, polymorphism allows same method name to perform different tasks depending on object.\n\nExample:\n- Dog class sound() prints Bark\n- Cat class sound() prints Meow\n\nBoth use same method name sound().",
        algorithm: [
            "Step 1: Start program.",
            "Step 2: Create multiple classes.",
            "Step 3: Define same method name in each class.",
            "Step 4: Create objects.",
            "Step 5: Call method using objects.",
            "Step 6: Display output.",
            "Step 7: Stop program."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Lab.",
            "Step 3: Select Experiment 9.",
            "Step 4: Read Aim and Theory.",
            "Step 5: Observe default code.",
            "Step 6: Click Run button.",
            "Step 7: Observe output.",
            "Step 8: Verify polymorphism.",
            "Step 9: Modify code.",
            "Step 10: Run again."
        ],
        result: "The program executed successfully, and different outputs were produced using the same method name.",
        conclusion: "From this experiment, we learned how polymorphism allows the same method name to behave differently. It improves flexibility and supports object-oriented programming.",
        defaultCode: `# Python program demonstrating polymorphism

class Dog:
    def sound(self):
        print("Dog barks")

class Cat:
    def sound(self):
        print("Cat meows")

animals = [Dog(), Cat()]

for animal in animals:
    animal.sound()`,
        language: "python"
    },
    {
        id: 10,
        title: "Exception Handling",
        description: "Handling runtime errors gracefully using try-except blocks.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement exception handling in Python. Exception handling prevents program crashes and handles errors properly.",
        theory: "Exception is an error that occurs during program execution.\n\nPython provides try and except blocks to handle exceptions.\n\nSyntax:\ntry:\n    code\nexcept:\n    handle error\n\nAdvantages: Prevents program crash, improves program reliability, handles runtime errors safely.",
        algorithm: [
            "Step 1: Start program.",
            "Step 2: Write code inside try block.",
            "Step 3: Exception occurs.",
            "Step 4: Except block handles error.",
            "Step 5: Display result.",
            "Step 6: Stop program."
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab.",
            "Step 2: Select Python Lab.",
            "Step 3: Select Experiment 10.",
            "Step 4: Read Aim and Theory.",
            "Step 5: Observe default code.",
            "Step 6: Click Run button.",
            "Step 7: Observe error handling.",
            "Step 8: Modify input.",
            "Step 9: Run again.",
            "Step 10: Verify exception handling."
        ],
        result: "The program executed successfully, and errors were handled properly using exception handling.",
        conclusion: "From this experiment, we learned how to handle runtime errors using exception handling. It prevents program crashes and improves reliability.",
        defaultCode: `# Python program demonstrating exception handling

try:
    num = int(input("Enter number: "))
    result = 10 / num
    print("Result:", result)

except ZeroDivisionError:
    print("Error: Cannot divide by zero")

except ValueError:
    print("Error: Invalid input")`,
        language: "python"
    },
    {
        id: 11,
        title: "File Operations",
        description: "Reading from and writing to local files.",
        difficulty: "Hard",
        objective: "To understand basic file I/O operations (write and read).",
        theory: "Python has functions for creating, reading, updating, and deleting files.\n- open(filename, mode): Opens a file.\n- 'w': Write mode.\n- 'r': Read mode.\n- 'a': Append mode.\n\nAlways close the file after operations using file.close().",
        algorithm: [
            "Step 1: Start",
            "Step 2: Open a file in write mode ('w')",
            "Step 3: Write a string into the file",
            "Step 4: Close the file",
            "Step 5: Open the file in read mode ('r')",
            "Step 6: Read content and print it",
            "Step 7: Close the file",
            "Step 8: Stop"
        ],
        procedure: [
            "Step 1: Select Experiment 11",
            "Step 2: Run the program",
            "Step 3: Verify that the text written to the file is read back correctly"
        ],
        result: "Data was successfully stored in and retrieved from a text file.",
        conclusion: "Learned how to persist data across sessions using file operations.",
        defaultCode: `file = open("test.txt", "w")
file.write("Hello from Virtual Python Lab!")
file.close()

file = open("test.txt", "r")
print("File Content:", file.read())
file.close()`,
        language: "python"
    },
    {
        id: 12,
        title: "Real-world Problem Solving",
        description: "Applying logic to solve common scenarios like Even/Odd checks.",
        difficulty: "Easy",
        objective: "To apply basic programming logic to solve common real-world problems.",
        theory: "Many real-world problems can be solved using simple parity logic or mathematical checks. The modulo operator is key for divisibility problems.",
        algorithm: [
            "Step 1: Start",
            "Step 2: Input a number",
            "Step 3: Check if number % 2 is 0",
            "Step 4: Print 'Even' if true, else 'Odd'",
            "Step 5: Stop"
        ],
        procedure: [
            "Step 1: Select Experiment 12",
            "Step 2: Input various numbers in the user panel",
            "Step 3: Verify the classification"
        ],
        result: "The program correctly identifies integers as even or odd.",
        conclusion: "Learned how to map real-world conditions to programming logic.",
        defaultCode: `num = int(input("Enter number: "))

if num % 2 == 0:
    print(num, "is an Even number")
else:
    print(num, "is an Odd number")`,
        language: "python"
    },
    {
        id: 13,
        title: "Advanced Python Programs",
        description: "Using functional programming concepts like Lambda and Map.",
        difficulty: "Hard",
        objective: "To explore advanced features like lambda functions and functional mapping.",
        theory: "Lambda functions are small anonymous functions. They can take any number of arguments but can only have one expression.\n\nThe map() function executes a specified function for each item in an iterable. These functional programming concepts enable concise, expressive data transformations.",
        algorithm: [
            "Step 1: Start",
            "Step 2: Define a list of numbers",
            "Step 3: Use map() with a lambda to square all numbers",
            "Step 4: Convert result back to list and print",
            "Step 5: Stop"
        ],
        procedure: [
            "Step 1: Select Experiment 13",
            "Step 2: Run the script",
            "Step 3: Verify the squared results in the console"
        ],
        result: "Successfully used functional programming to transform a data collection.",
        conclusion: "Learned advanced, concise ways to process data in Python.",
        defaultCode: `nums = [1, 2, 3, 4, 5]

squares = list(map(lambda x: x * x, nums))

print("Original list:", nums)
print("Squared list:", squares)`,
        language: "python"
    }
];
