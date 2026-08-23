// C Programming Lab — Experiment Data
// Source: VirtualCompiler (vcompilers/client/src/c-lab/data/cExperiments.js)
// Converted to TypeScript for PrayuktiVLab integration

export interface LabExperiment {
    id: number;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    objective: string;
    theory: string;
    algorithm: string[];
    procedure: string[];
    result: string;
    conclusion: string;
    defaultCode: string;
    language?: string;
}

export const cExperiments: LabExperiment[] = [
    {
        id: 1,
        title: "Basic Input Output using printf and scanf",
        description: "Write programs to print statements in sequential order using simple printf and scanf input/output functions.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand the basic structure of a C program and learn how to use printf() and scanf() functions for displaying output and taking input from the user. This experiment helps students understand how statements are executed sequentially in a C program.",
        theory: "C is a procedural programming language where instructions are executed sequentially from top to bottom. Input and output operations are essential in any programming language for interacting with the user.\n\nThe printf() function is used to display output on the screen. It can print text and values of variables using format specifiers like %d for integers. The scanf() function is used to take input from the user and store it in a variable. It requires the memory address of the variable where the data should be stored, which is provided using the '&' (ampersand) symbol.\n\nThese functions are defined in the stdio.h (Standard Input Output) header file. Including this file at the beginning of your program is mandatory to use these functions. Understanding sequential execution is fundamental, as it means the computer processes each line of code one after another in order.",
        algorithm: [
            "Start the program",
            "Include the stdio.h header file",
            "Declare a variable to store input",
            "Display a message using printf() to prompt the user",
            "Take input from the user using scanf()",
            "Display the entered value using printf() for verification",
            "Stop the program"
        ],
        procedure: [
            "Open the C programming environment",
            "Create a new C program file",
            "Include stdio.h header file at the top",
            "Write the main() function",
            "Declare required variables (e.g., int a)",
            "Use printf() to display a message on the screen",
            "Use scanf() to take input from the keyboard",
            "Compile the program to check for errors",
            "Run the program",
            "Observe the output on the console"
        ],
        result: "The program was successfully executed, and the input and output operations using printf() and scanf() functions were performed correctly.",
        conclusion: "From this experiment, we learned how to write a basic C program and how to use printf() and scanf() functions for input and output operations. We also understood how statements execute sequentially in a C program.",
        defaultCode: `#include <stdio.h>\n\nint main() {\n    int a;\n    printf("Enter number: ");\n    scanf("%d", &a);\n    printf("You entered: %d", a);\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 2,
        title: "if-else and Nested if",
        description: "Write programs to implement if-else condition (simple as well as nested) on suitable problems.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement decision-making statements in C programming using if, if-else, and nested if statements. These statements help the program to make decisions and execute different instructions based on given conditions.",
        theory: "Decision-making in C is a process where the program chooses to execute certain parts of the code based on whether a condition is true or false.\n\nThe 'if' statement is the simplest form. It checks a condition, and if that condition is true, the block of code inside the curly braces is executed. The 'if-else' statement provides an alternative: if the condition is true, the first block runs; if the condition is false, the code in the 'else' block runs instead.\n\nA 'nested if' statement is simply an 'if' statement placed inside another 'if' or 'else' block. This is useful when you have multiple levels of conditions.",
        algorithm: [
            "Start the program",
            "Include stdio.h header file",
            "Declare three integer variables: a, b, and c",
            "Ask the user to enter three numbers",
            "Take input using scanf function",
            "Compare first number (a) with second number (b)",
            "If a > b, then compare a with third number (c)",
            "If a > c is true, display a as largest",
            "Otherwise, display c as largest",
            "Else (if a <= b), compare second number (b) with third number (c)",
            "If b > c is true, display b as largest",
            "Otherwise, display c as largest",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C programming environment",
            "Create a new C program file",
            "Include the stdio.h header file at the top",
            "Write the main function",
            "Declare three integer variables (a, b, c)",
            "Use printf to display a message to the user",
            "Use scanf to take three inputs from the user",
            "Implement the nested if-else logic to compare the numbers",
            "Use printf to display the result (the largest number)",
            "Compile the program to check for syntax errors",
            "Run the program",
            "Enter different values and observe how the output changes"
        ],
        result: "The program was successfully executed, and the largest number among the given three numbers was determined using if-else and nested if statements.",
        conclusion: "From this experiment, we learned how to use if-else and nested if statements in C programming. These statements help the program make decisions based on conditions.",
        defaultCode: `#include <stdio.h>\n\nint main()\n{\n    int a, b, c;\n\n    printf("Enter three numbers: ");\n    scanf("%d %d %d", &a, &b, &c);\n\n    if(a > b)\n    {\n        if(a > c)\n            printf("Largest number is: %d", a);\n        else\n            printf("Largest number is: %d", c);\n    }\n    else\n    {\n        if(b > c)\n            printf("Largest number is: %d", b);\n        else\n            printf("Largest number is: %d", c);\n    }\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 3,
        title: "switch-case Conditional Statement",
        description: "Write a program to implement switch-case conditional logic on suitable examples.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement the switch-case statement in C programming. The switch-case statement is used to perform different actions based on different conditions.",
        theory: "Sometimes in programming, we need to choose one option from many possible choices. While multiple if-else statements can handle this, they can become messy and difficult to read. This is where the 'switch-case' statement comes in handy.\n\nThe switch statement checks the value of an expression (like a variable) and compares it with several possible constant values called 'cases'. If a match is found, the code under that case is executed. The 'break' statement is very important—it tells the computer to stop executing further cases once a match is found. If no cases match, an optional 'default' block runs.",
        algorithm: [
            "Start the program",
            "Include stdio.h header file",
            "Declare required variables for the operands and the choice",
            "Display a menu of operations to the user",
            "Take the operation choice from the user using scanf",
            "Use the switch statement to evaluate the user's choice",
            "In each case, perform the corresponding arithmetic operation",
            "Display the result using printf",
            "Use 'break' to exit the switch block after each case",
            "Use 'default' to handle any invalid inputs",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include the stdio.h header file",
            "Write the main() function",
            "Declare variables for storing numbers and the operation choice",
            "Use printf() to show the user a menu of available options",
            "Use scanf() to take input for numbers and the choice",
            "Write a switch-case block to handle the menu logic",
            "Make sure to include 'break' after each case to prevent 'fall-through'",
            "Compile and run the program",
            "Select an operation and verify if the result is correct"
        ],
        result: "The program was successfully executed, and the switch-case statement was used to perform different operations based on user input.",
        conclusion: "From this experiment, we learned how to use the switch-case statement in C programming. It helps the program choose one option from multiple choices.",
        defaultCode: `#include <stdio.h>\n\nint main()\n{\n    int choice;\n    int a, b, result;\n\n    printf("Enter two numbers: ");\n    scanf("%d %d", &a, &b);\n\n    printf("\\nSelect operation:\\n");\n    printf("1. Addition\\n");\n    printf("2. Subtraction\\n");\n    printf("3. Multiplication\\n");\n    printf("4. Division\\n");\n\n    printf("Enter your choice: ");\n    scanf("%d", &choice);\n\n    switch(choice)\n    {\n        case 1:\n            result = a + b;\n            printf("Addition = %d", result);\n            break;\n        case 2:\n            result = a - b;\n            printf("Subtraction = %d", result);\n            break;\n        case 3:\n            result = a * b;\n            printf("Multiplication = %d", result);\n            break;\n        case 4:\n            if(b != 0) {\n                result = a / b;\n                printf("Division = %d", result);\n            } else {\n                printf("Error: Division by zero");\n            }\n            break;\n        default:\n            printf("Invalid choice");\n    }\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 4,
        title: "Loop Control Statements",
        description: "Write programs to implement for, while and do-while loop control statements on suitable problems.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement loop control statements in C programming using for loop, while loop, and do-while loop. Loops help repeat a block of code multiple times and are useful for solving problems that require repetition.",
        theory: "In C programming, a loop is used to execute a block of code repeatedly until a specific condition becomes false.\n\n1. **For Loop**: Best used when you know exactly how many times the code should run.\n2. **While Loop**: A 'pre-test' loop that checks the condition first.\n3. **Do-While Loop**: A 'post-test' loop that executes the code block at least once before checking the condition.",
        algorithm: [
            "Start the program",
            "Include stdio.h header file",
            "Declare required variables (like int i)",
            "Initialize the loop variable",
            "Apply the loop condition (e.g., i <= 5)",
            "Execute the statements inside the loop body",
            "Update the loop variable (increment or decrement)",
            "Repeat the process until the condition becomes false",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include the stdio.h header file",
            "Write the main() function",
            "Declare a loop control variable (e.g., int i)",
            "Implement a for loop to print numbers from 1 to 5",
            "Implement a while loop to print the same range",
            "Implement a do-while loop for comparison",
            "Use printf() to clearly distinguish between the loops in the output",
            "Compile and run the program to see the result"
        ],
        result: "The program was successfully executed, and numbers were printed using for, while, and do-while loop control statements.",
        conclusion: "From this experiment, we learned how to use for loop, while loop, and do-while loop in C programming. These loops help execute statements repeatedly.",
        defaultCode: `#include <stdio.h>\n\nint main()\n{\n    int i;\n\n    printf("For Loop:\\n");\n    for(i = 1; i <= 5; i++)\n    {\n        printf("%d\\n", i);\n    }\n\n    printf("\\nWhile Loop:\\n");\n    i = 1;\n    while(i <= 5)\n    {\n        printf("%d\\n", i);\n        i++;\n    }\n\n    printf("\\nDo-While Loop:\\n");\n    i = 1;\n    do\n    {\n        printf("%d\\n", i);\n        i++;\n    }\n    while(i <= 5);\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 5,
        title: "1D and 2D Arrays",
        description: "Write programs to implement 1D & 2D array concepts on suitable problems such as sorting, searching, matrix operations.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement 1D and 2D arrays in C programming. Arrays are used to store multiple values in a single variable.",
        theory: "An array is a collection of elements of the same data type stored in contiguous memory locations.\n\nIn a **One-Dimensional (1D) array**, elements are stored in a single row. You access each item using an 'index', which starts at 0.\n\nA **Two-Dimensional (2D) array** can be thought of as a table with rows and columns (a matrix). To find a specific value, you need two indices: one for the row and one for the column.",
        algorithm: [
            "Start the program",
            "Include stdio.h header file",
            "Declare array variables (e.g., a[2][2], b[2][2], sum[2][2])",
            "Take array input for the first matrix from the user using nested loops",
            "Take array input for the second matrix following the same process",
            "Perform the matrix addition by adding corresponding elements",
            "Display the resulting 'sum' matrix using nested loops",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include the stdio.h header file at the top",
            "Write the main() function",
            "Declare 2D array variables for two matrices and their sum",
            "Use nested for loops to take input for both matrices",
            "Implement a nested for loop to calculate the sum of the two matrices element by element",
            "Display the final matrix on the console using printf() within nested loops",
            "Compile and run the program",
            "Enter values for 2x2 matrices and observe the output"
        ],
        result: "The program was successfully executed, and array and matrix operations were performed correctly using 1D and 2D arrays.",
        conclusion: "From this experiment, we learned how to use 1D and 2D arrays in C programming. Arrays are very useful for handling large amounts of data efficiently.",
        defaultCode: `#include <stdio.h>\n\nint main()\n{\n    int a[2][2], b[2][2], sum[2][2];\n    int i, j;\n\n    printf("Enter elements of first matrix:\\n");\n    for(i=0;i<2;i++)\n    {\n        for(j=0;j<2;j++)\n        {\n            printf("a[%d][%d]: ", i, j);\n            scanf("%d",&a[i][j]);\n        }\n    }\n\n    printf("Enter elements of second matrix:\\n");\n    for(i=0;i<2;i++)\n    {\n        for(j=0;j<2;j++)\n        {\n            printf("b[%d][%d]: ", i, j);\n            scanf("%d",&b[i][j]);\n        }\n    }\n\n    for(i=0;i<2;i++)\n        for(j=0;j<2;j++)\n            sum[i][j] = a[i][j] + b[i][j];\n\n    printf("\\nSum of matrices:\\n");\n    for(i=0;i<2;i++)\n    {\n        for(j=0;j<2;j++)\n            printf("%d ", sum[i][j]);\n        printf("\\n");\n    }\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 6,
        title: "String Operations",
        description: "Write programs to implement string related concepts such as sorting, finding length, reversing, concatenation, comparing two strings.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement string operations in C programming such as finding the length, reversing a string, comparing, and concatenating strings.",
        theory: "In C programming, a string is a collection of characters stored in an array and terminated by a special null character `\\0`. Unlike other languages, C doesn't have a 'string' data type; it uses arrays of type `char`.\n\nC provides a standard library called `string.h` which contains many useful built-in functions: strlen(), strcpy(), strcat(), strcmp().",
        algorithm: [
            "Start the program",
            "Include stdio.h and string.h header files",
            "Declare two character arrays (strings): str and rev",
            "Take string input from the user using scanf",
            "Find the length of the string using the strlen() function",
            "Use a loop to iterate from the last character towards the first",
            "Store each character into the 'rev' array sequentially",
            "Add the null character '\\0' at the end of the 'rev' string",
            "Display both the original and reversed strings",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include stdio.h and string.h header files at the top",
            "Write the main() function",
            "Declare string variables (char arrays) of sufficient size",
            "Use printf() to prompt the user for string input",
            "Use scanf() to read the input text",
            "Implement a loop logic to reverse the string manually",
            "Ensure the resulting reversed string is properly null-terminated",
            "Use printf() to display the results for comparison",
            "Compile and run the program to see the reversal in action"
        ],
        result: "The program was successfully executed, and string operations such as finding length and reversing the string were performed correctly.",
        conclusion: "From this experiment, we learned how to work with strings in C programming. String handling is very important in programming for working with text data.",
        defaultCode: `#include <stdio.h>\n#include <string.h>\n\nint main()\n{\n    char str[100];\n    char rev[100];\n    int i, len;\n\n    printf("Enter a string: ");\n    scanf("%s", str);\n\n    len = strlen(str);\n\n    for(i=0; i<len; i++)\n        rev[i] = str[len-i-1];\n\n    rev[len] = '\\0';\n\n    printf("Original string: %s\\n", str);\n    printf("Reversed string: %s\\n", rev);\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 7,
        title: "User Defined Functions",
        description: "Write programs to implement concept of user defined functions (call by value, call by reference, recursive calling) on suitable examples.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement user defined functions in C programming. Functions help divide a program into smaller parts, making it easier to understand and manage.",
        theory: "A function is a block of code that performs a specific task. In C, functions are used to break down large programs into smaller, more manageable 'modules'.\n\nThere are two main ways to pass data to functions:\n1. **Call by Value**: A copy of the actual variable's data is passed.\n2. **Call by Reference**: Instead of the value, you pass the memory address of the variable using pointers.\n\n**Recursion** is where a function calls itself to solve a smaller version of the same problem.",
        algorithm: [
            "Start the program",
            "Include the stdio.h header file",
            "Define the function (e.g., factorial) with its logic",
            "Declare variables in the main() function to store user input and the result",
            "Prompt the user for input and read it using scanf()",
            "Call the function by passing the input variable as an argument",
            "Inside the function, perform the required operation (using recursion for factorial)",
            "Return the calculated result back to the main() function",
            "Display the final result on the console using printf()",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include the stdio.h header file at the top",
            "Define the function prototype or the full function before main()",
            "Implement the main() function for program execution",
            "Take the necessary input from the user using scanf()",
            "Call the defined function with the appropriate arguments",
            "Capture the return value or observe the side effects",
            "Display the results using printf() for clear output",
            "Compile and run the program"
        ],
        result: "The program was successfully executed, and user defined functions and recursion were implemented correctly.",
        conclusion: "From this experiment, we learned how to create and use user defined functions in C programming. Functions help make programs more organized and reusable.",
        defaultCode: `#include <stdio.h>\n\nint factorial(int n)\n{\n    if(n == 0)\n        return 1;\n    else\n        return n * factorial(n-1);\n}\n\nint main()\n{\n    int num, result;\n\n    printf("Enter a number: ");\n    scanf("%d", &num);\n\n    result = factorial(num);\n\n    printf("Factorial of %d = %d", num, result);\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 8,
        title: "Pointer Concepts",
        description: "Write programs to implement concepts of pointer.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement pointer concepts in C programming. Pointers are variables that store the address of another variable.",
        theory: "A pointer is a special type of variable that stores the memory address of another variable instead of a regular value.\n\nTwo key symbols are used with pointers:\n1. **& (Address-of Operator)**: Used to get the memory address of a variable.\n2. *** (Dereference Operator)**: Used to access the value stored at the address a pointer is holding.",
        algorithm: [
            "Start the program",
            "Include stdio.h header file",
            "Declare an integer variable (e.g., num = 10)",
            "Declare a pointer variable (e.g., int *ptr)",
            "Assign the memory address of the variable to the pointer using &",
            "Access the value of the variable directly and via the pointer using *",
            "Display the variable's value and its memory address",
            "Display the pointer's stored address and the value it points to",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include the stdio.h header file at the top",
            "Write the main() function",
            "Declare a regular variable and initialize it",
            "Declare a pointer variable of the same data type",
            "Assign the address of the regular variable to the pointer using the & operator",
            "Use printf() with the %p format specifier to display memory addresses",
            "Use printf() with the * operator to display the value via the pointer",
            "Compile and run the program"
        ],
        result: "The program was successfully executed, and pointer variables were used to store and access the address and value of another variable.",
        conclusion: "From this experiment, we learned how to use pointers in C programming. Pointers are very useful for efficient memory handling and advanced programming concepts.",
        defaultCode: `#include <stdio.h>\n\nint main()\n{\n    int num = 10;\n    int *ptr;\n\n    ptr = &num;\n\n    printf("Value of num = %d\\n", num);\n    printf("Address of num = %p\\n", &num);\n    printf("Pointer ptr stores address = %p\\n", ptr);\n    printf("Value using pointer = %d\\n", *ptr);\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 9,
        title: "Structure and Union",
        description: "Write programs to implement the concept of structure and union.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement structures and unions in C programming. Structures and unions are user-defined data types used to store multiple types of data in a single variable.",
        theory: "In C, a **structure** is a user-defined data type that allows you to group together variables of different data types under a single name.\n\nA **union** is very similar to a structure, but with one major difference: members of a union share the same memory location. While a structure allocates separate memory for each member, a union only allocates enough memory for its largest member.",
        algorithm: [
            "Start the program",
            "Include stdio.h header file",
            "Define the structure (e.g., struct Student) with required fields",
            "In the main() function, declare a variable of that structure type",
            "Prompt the user to enter data for each member",
            "Store the input values directly into the structure members using the dot (.) operator",
            "Retrieve and display the stored information",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include the stdio.h header file at the top",
            "Define the structure template outside the main() function",
            "Declare a local structure variable in main()",
            "Use printf() to ask for student details sequentially",
            "Use scanf() to read input for each member",
            "Display a clean table or list of the entered details using printf()",
            "Compile and verify there are no syntax errors",
            "Run the program and enter sample data"
        ],
        result: "The program was successfully executed, and structure was used to store and display multiple types of data in a single variable.",
        conclusion: "From this experiment, we learned how to use structures and unions in C programming. These concepts are very useful for managing complex data.",
        defaultCode: `#include <stdio.h>\n\nstruct Student\n{\n    int id;\n    char name[20];\n    float marks;\n};\n\nint main()\n{\n    struct Student s;\n\n    printf("Enter student ID: ");\n    scanf("%d", &s.id);\n\n    printf("Enter student name: ");\n    scanf("%s", s.name);\n\n    printf("Enter student marks: ");\n    scanf("%f", &s.marks);\n\n    printf("\\nStudent Details:\\n");\n    printf("ID = %d\\n", s.id);\n    printf("Name = %s\\n", s.name);\n    printf("Marks = %.2f\\n", s.marks);\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 10,
        title: "Dynamic Memory Allocation",
        description: "Write programs to implement dynamic memory allocation functions such as malloc, calloc, realloc, and free.",
        difficulty: "Hard",
        objective: "The aim of this experiment is to understand and implement dynamic memory allocation in C programming using malloc(), calloc(), realloc(), and free() functions.",
        theory: "Dynamic Memory Allocation is the process of allocating memory at 'run-time' rather than at 'compile-time'. Memory for dynamic allocation is taken from a region called the **Heap**.\n\nC provides four standard functions in `<stdlib.h>`:\n- **malloc()**: Allocates a single large block of memory.\n- **calloc()**: Allocates multiple blocks and initializes them to zero.\n- **realloc()**: Changes the size of previously allocated memory.\n- **free()**: Releases the allocated memory back to the system.",
        algorithm: [
            "Start the program",
            "Include stdio.h and stdlib.h header files",
            "Declare an integer pointer variable (e.g., *ptr)",
            "Declare variables for size and loops (e.g., n, i)",
            "Take the number of elements 'n' from the user",
            "Allocate memory using malloc() for 'n' elements",
            "Check if memory allocation was successful (ptr != NULL)",
            "Store values in the allocated heap space using a for loop",
            "Display the stored values on the console",
            "Release the allocated memory using free(ptr)",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include stdio.h and stdlib.h header files at the top",
            "Write the main() function",
            "Declare a pointer variable and variables for size and iteration",
            "Use printf() to ask the user for the number of elements",
            "Use malloc() to request the exact amount of memory from the heap",
            "Implement an error check for NULL pointer",
            "Use scanf() within a loop to take input into the dynamic array",
            "Use printf() in another loop to display the data",
            "Call free() to deallocate the memory safely",
            "Compile and run the program"
        ],
        result: "The program was successfully executed, and dynamic memory was allocated and used using malloc() function.",
        conclusion: "From this experiment, we learned how to use dynamic memory allocation functions such as malloc(), calloc(), realloc(), and free() in C programming.",
        defaultCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main()\n{\n    int *ptr, n, i;\n\n    printf("Enter number of elements: ");\n    scanf("%d", &n);\n\n    ptr = (int*) malloc(n * sizeof(int));\n\n    if(ptr == NULL)\n    {\n        printf("Memory allocation failed");\n        return 0;\n    }\n\n    printf("Enter elements:\\n");\n    for(i=0; i<n; i++)\n    {\n        printf("Element %d: ", i + 1);\n        scanf("%d", &ptr[i]);\n    }\n\n    printf("\\nEntered elements are: ");\n    for(i=0; i<n; i++)\n        printf("%d ", ptr[i]);\n    printf("\\n");\n\n    free(ptr);\n\n    return 0;\n}`,
        language: "c"
    },
    {
        id: 11,
        title: "File Handling",
        description: "Write programs to implement file handling concepts such as reading from a file and writing to a file using fopen, fclose, fprintf, fscanf, getc, putc.",
        difficulty: "Hard",
        objective: "The aim of this experiment is to understand and implement file handling in C programming. File handling allows storing data permanently in files and reading data from files.",
        theory: "File Handling in C is used to store data permanently on a storage device instead of just keeping it in the computer's temporary memory (RAM).\n\nCommon functions for file operations include:\n- **fopen()**: Opens a file in 'r' (read), 'w' (write), or 'a' (append) mode.\n- **fclose()**: Closes the file.\n- **fprintf()**: Writes data into a file.\n- **fscanf()**: Reads data from a file.\n- **getc() / putc()**: Used for reading or writing a single character.",
        algorithm: [
            "Start the program",
            "Include stdio.h header file",
            "Declare a file pointer variable (FILE *fp) and storage variables",
            "Open a file named 'student.txt' in write mode ('w') using fopen()",
            "Check if the file was successfully opened (fp != NULL)",
            "Ask the user for input and write it to the file using fprintf()",
            "Close the file using fclose() to save changes",
            "Reopen the same file in read mode ('r') using fopen()",
            "Read the stored data from the file using fscanf()",
            "Display the read data on the console using printf()",
            "Close the file again",
            "Stop the program"
        ],
        procedure: [
            "Open the Virtual Programming Lab or C compiler",
            "Create a new C program file",
            "Include the stdio.h header file at the top",
            "Declare a file pointer (FILE *) in the main() function",
            "Use fopen() with the 'w' mode to create or overwrite a file",
            "Take input from the console and use fprintf() to store it in the file",
            "Always call fclose() after writing to ensure the buffer is cleared",
            "Open the file again using 'r' mode to see your saved data",
            "Use fscanf() to retrieve the data back into a program variable",
            "Print the variable to the console to confirm the file operation was successful"
        ],
        result: "The program was successfully executed, and file handling operations such as writing to and reading from a file were demonstrated.",
        conclusion: "From this experiment, we learned how to use file handling in C programming. File handling is very useful for storing and retrieving data permanently.",
        defaultCode: `#include <stdio.h>\n\nint main()\n{\n    FILE *fp;\n    char name[50];\n\n    // Opening file in write mode\n    fp = fopen("student.txt", "w");\n\n    if(fp == NULL)\n    {\n        printf("File cannot be opened\\n");\n        return 0;\n    }\n\n    printf("Enter your name: ");\n    scanf("%s", name);\n\n    // Writing data to file\n    fprintf(fp, "%s", name);\n    fclose(fp);\n    printf("Data saved successfully to student.txt\\n");\n\n    // Opening file in read mode\n    fp = fopen("student.txt", "r");\n    if(fp != NULL)\n    {\n        fscanf(fp, "%s", name);\n        printf("Name retrieved from file: %s\\n", name);\n        fclose(fp);\n    }\n\n    return 0;\n}`,
        language: "c"
    }
];
