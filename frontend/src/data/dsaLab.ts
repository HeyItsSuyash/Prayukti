// Data Structures Lab — Experiment Data
// Source: VirtualCompiler (vcompilers/client/src/ds-lab/data/dsExperiments.js)
// Converted to TypeScript for PrayuktiVLab integration
// Uses C++ as default language (DSA typically taught in C++)

import type { LabExperiment } from "./cLab";

export const dsaExperiments: LabExperiment[] = [
    {
        id: 1,
        title: "Searching and Sorting Techniques",
        description: "Implementation of searching and sorting techniques including Linear search and Bubble sort.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement searching and sorting techniques using Data Structures. Searching is used to find an element in a list, and sorting is used to arrange elements in a specific order.",
        theory: "### Searching\nSearching is the process of finding a specific element in a data structure.\n\n### Linear Search\nLinear search checks each element one by one. For example, if we have an array [5, 10, 15, 20] and we want to search for 15, we compare 15 with each element starting from the first until it is found.\n\n### Binary Search\nBinary search works only on sorted arrays. It repeatedly divides the search interval in halves.\n\n### Sorting\nSorting is the process of arranging elements in a specific order.\n\n### Bubble Sort\nBubble sort is a simple sorting algorithm that compares adjacent elements and swaps them if they are in the wrong order.",
        algorithm: [
            "Linear Search Algorithm:",
            "Step 1: Start",
            "Step 2: Read number of elements",
            "Step 3: Store elements in array",
            "Step 4: Read element to search",
            "Step 5: Compare element with each array value",
            "Step 6: If found, display position",
            "Step 7: Else display not found",
            "Step 8: Stop",
            "Bubble Sort Algorithm:",
            "Step 1: Start from the first element, compare adjacent elements.",
            "Step 2: If the current element is greater than the next element, swap them.",
            "Step 3: Repeat for all elements in the array.",
            "Step 4: Repeat until the array is fully sorted.",
            "Step 5: Stop"
        ],
        procedure: [
            "Step 1: Open Data Structure Virtual Lab",
            "Step 2: Select Experiment 1",
            "Step 3: Read Aim and Theory",
            "Step 4: Observe Algorithm",
            "Step 5: Write or load default code",
            "Step 6: Click Run button",
            "Step 7: Observe output",
            "Step 8: Verify result"
        ],
        result: "The program was successfully executed and the searching and sorting techniques were implemented correctly.",
        conclusion: "From this experiment, we learned how to implement searching and sorting techniques using arrays. These are fundamental operations in Data Structures.",
        defaultCode: `#include<iostream>
using namespace std;

int main()
{
    int arr[100], n, i, key;
    bool found=false;

    cout<<"Enter number of elements: ";
    cin>>n;

    cout<<"Enter elements:\\n";
    for(i=0;i<n;i++)
        cin>>arr[i];

    cout<<"Enter element to search: ";
    cin>>key;

    for(i=0;i<n;i++)
    {
        if(arr[i]==key)
        {
            found=true;
            cout<<"Element found at position "<<i+1;
            break;
        }
    }

    if(!found)
        cout<<"Element not found";

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 2,
        title: "List using Array and Linked List",
        description: "Implementation of List data structure using static arrays and dynamic Linked Lists.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement list data structures using arrays and linked lists. A list is a collection of elements stored in a sequence.",
        theory: "### What is a List?\nA list is a collection of elements stored in order.\n\n### Array List\nIn an array list, elements are stored in continuous memory locations. Fast access, but fixed size.\n\n### Linked List\nA linked list stores elements using nodes. Each node contains data and a pointer to the next node. Example: 10 → 20 → 30 → NULL\n\nAdvantages: Dynamic size, efficient insertion and deletion.\nDisadvantages: More memory usage, slower access.",
        algorithm: [
            "Linked List Creation Algorithm:",
            "Step 1: Start",
            "Step 2: Create node structure with data and next pointer",
            "Step 3: Allocate memory for the node",
            "Step 4: Store data in the node",
            "Step 5: Link nodes using pointers",
            "Step 6: Traverse and display the list",
            "Step 7: Stop"
        ],
        procedure: [
            "Step 1: Open Virtual Data Structure Lab",
            "Step 2: Select Experiment 2",
            "Step 3: Read Aim and Theory",
            "Step 4: Observe Algorithm",
            "Step 5: Load default program",
            "Step 6: Click Run button",
            "Step 7: Observe output",
            "Step 8: Verify result"
        ],
        result: "The program was successfully executed, and the list was created using array and linked list.",
        conclusion: "From this experiment, we learned how to implement lists using arrays and linked lists. Lists are an important part of Data Structures.",
        defaultCode: `#include<iostream>
using namespace std;

struct node
{
    int data;
    node *next;
};

int main()
{
    node *head=NULL, *newnode, *temp;
    int n, i;

    cout<<"Enter number of nodes: ";
    cin>>n;

    for(i=0;i<n;i++)
    {
        newnode=new node;

        cout<<"Enter data: ";
        cin>>newnode->data;

        newnode->next=NULL;

        if(head==NULL)
            head=newnode;
        else
        {
            temp=head;
            while(temp->next!=NULL)
                temp=temp->next;
            temp->next=newnode;
        }
    }

    temp=head;

    cout<<"Linked List: ";

    while(temp!=NULL)
    {
        cout<<temp->data<<" ";
        temp=temp->next;
    }

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 3,
        title: "Stack Push and Pop Operations",
        description: "Implementation of Push and Pop operations on a Stack using an array.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement stack data structure using push and pop operations. Stack is a linear data structure that follows Last In First Out (LIFO) principle.",
        theory: "### What is a Stack?\nA stack is a linear data structure that follows the **Last In First Out (LIFO)** principle.\n\nExample: Think of a stack of plates. The last plate placed on top is the first one to be removed.\n\n### Stack Operations\n- **Push:** Insert an element onto the top of the stack.\n- **Pop:** Remove the top element from the stack.\n- **Peek:** View the current top element without removing it.\n\n### Stack States\n- **Overflow:** Stack is full.\n- **Underflow:** Stack is empty.",
        algorithm: [
            "Step 1: Start program",
            "Step 2: Initialize stack with MAX size and top = -1",
            "Step 3: Push Operation: Check overflow, else increment top and insert element",
            "Step 4: Pop Operation: Check underflow, else remove top element and decrement top",
            "Step 5: Display stack elements and results",
            "Step 6: Stop program"
        ],
        procedure: [
            "Step 1: Open Data Structure Virtual Lab",
            "Step 2: Select Experiment 3",
            "Step 3: Read Aim and Theory",
            "Step 4: Observe Algorithm",
            "Step 5: Load default stack program",
            "Step 6: Click Run button",
            "Step 7: Observe push and pop output",
            "Step 8: Verify result"
        ],
        result: "The program was successfully executed, and stack operations push and pop were implemented correctly following LIFO principle.",
        conclusion: "From this experiment, we learned how stack data structure works using push and pop operations. Stack is widely used in expression evaluation and function calls.",
        defaultCode: `#include<iostream>
using namespace std;

#define MAX 5

int stack[MAX];
int top = -1;

void push(int value)
{
    if(top == MAX-1)
        cout<<"Stack Overflow\\n";
    else
    {
        top++;
        stack[top] = value;
        cout<<value<<" pushed into stack\\n";
    }
}

void pop()
{
    if(top == -1)
        cout<<"Stack Underflow\\n";
    else
    {
        cout<<stack[top]<<" popped from stack\\n";
        top--;
    }
}

void display()
{
    cout<<"Stack elements are:\\n";

    for(int i=top;i>=0;i--)
        cout<<stack[i]<<endl;
}

int main()
{
    push(10);
    push(20);
    push(30);

    display();

    pop();

    display();

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 4,
        title: "Polish Notation and Conversion",
        description: "Implementation of Infix to Postfix conversion using Polish Notation principles.",
        difficulty: "Hard",
        objective: "The aim of this experiment is to understand and implement Polish Notation and its conversion using stack data structure.",
        theory: "### Types of Expressions\n- **Infix:** Operator between operands. Example: A + B\n- **Prefix (Polish Notation):** Operator before operands. Example: + A B\n- **Postfix (Reverse Polish Notation):** Operator after operands. Example: A B +\n\n### Why Polish Notation?\n1. No Brackets needed.\n2. Computers can evaluate postfix expressions faster using a stack.\n\n### Role of Stack\nA stack stores operators and maintains precedence during conversion.",
        algorithm: [
            "Step 1: Start program",
            "Step 2: Initialize an empty stack for operators",
            "Step 3: Read the infix expression from left to right",
            "Step 4: If character is an operand, add it to the postfix expression",
            "Step 5: If character is '(', push it to stack",
            "Step 6: If character is ')', pop from stack until '(' is found",
            "Step 7: If character is an operator, pop operators with higher or equal priority, then push current operator",
            "Step 8: Pop any remaining operators from stack to postfix",
            "Step 9: Display the resulting postfix expression",
            "Step 10: Stop program"
        ],
        procedure: [
            "Step 1: Open Data Structure Virtual Lab",
            "Step 2: Select Experiment 4",
            "Step 3: Read Aim and Theory",
            "Step 4: Observe Algorithm",
            "Step 5: Load default conversion program",
            "Step 6: Click Run button",
            "Step 7: Observe postfix output",
            "Step 8: Verify result"
        ],
        result: "The program was successfully executed, and the infix expression was converted into postfix expression using stack data structure.",
        conclusion: "From this experiment, we learned how Polish notation works and how to convert infix expressions into postfix using stack.",
        defaultCode: `#include<iostream>
#include<cctype>
using namespace std;

#define MAX 100

char stack[MAX];
int top = -1;

void push(char x)
{
    stack[++top] = x;
}

char pop()
{
    return stack[top--];
}

int priority(char x)
{
    if(x=='(')
        return 0;
    if(x=='+' || x=='-')
        return 1;
    if(x=='*' || x=='/')
        return 2;
    return 0;
}

int main()
{
    char exp[100];
    char *e, x;

    cout<<"Enter infix expression: ";
    cin>>exp;

    e = exp;

    while(*e != '\\0')
    {
        if(isalnum(*e))
            cout<<*e;

        else if(*e == '(')
            push(*e);

        else if(*e == ')')
        {
            while((x = pop()) != '(')
                cout<<x;
        }

        else
        {
            while(priority(stack[top]) >= priority(*e))
                cout<<pop();
            push(*e);
        }

        e++;
    }

    while(top != -1)
        cout<<pop();

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 5,
        title: "Program to Solve Problems using Iteration and Recursion",
        description: "Comparing iterative and recursive approaches for solving problems like Factorial.",
        difficulty: "Easy",
        objective: "The aim of this experiment is to understand and implement problem-solving using iteration and recursion techniques.",
        theory: "### Iteration\nIteration is the process of repeating instructions using loops (for, while).\n\n### Recursion\nRecursion is a technique where a function calls itself to solve a smaller version of the same problem. Example: Factorial using n! = n * (n-1)!\n\n### Base Condition\nThe base condition is a state where the problem is small enough to be solved directly without further recursion.\n\n### Iteration vs Recursion\n- Iteration: Uses loops. Generally more memory-efficient.\n- Recursion: Uses function calls. Often results in simpler code.",
        algorithm: [
            "Step 1: Start program",
            "Step 2: Read number from the user",
            "Step 3: Calculate factorial using iteration (using a for loop)",
            "Step 4: Calculate factorial using recursion (function calling itself)",
            "Step 5: Display results of both methods",
            "Step 6: Stop program"
        ],
        procedure: [
            "Step 1: Open Data Structure Virtual Lab",
            "Step 2: Select Experiment 5",
            "Step 3: Read Aim and Theory",
            "Step 4: Observe Algorithm",
            "Step 5: Load default program",
            "Step 6: Click Run button",
            "Step 7: Observe factorial output",
            "Step 8: Verify result"
        ],
        result: "The program was successfully executed, and factorial was calculated using both iteration and recursion methods.",
        conclusion: "From this experiment, we learned how to solve problems using iteration and recursion. Both techniques are important in Data Structures and programming.",
        defaultCode: `#include<iostream>
using namespace std;

int factorialRec(int n)
{
    if(n==0)
        return 1;
    else
        return n * factorialRec(n-1);
}

int main()
{
    int n, i, fact=1;

    cout<<"Enter number: ";
    cin>>n;

    for(i=1;i<=n;i++)
        fact = fact * i;

    cout<<"Factorial using iteration = "<<fact<<endl;

    cout<<"Factorial using recursion = "<<factorialRec(n)<<endl;

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 6,
        title: "Program for Recursion Removal using Stack",
        description: "Simulating recursion by manually managing a Stack structure.",
        difficulty: "Hard",
        objective: "The aim of this experiment is to understand how recursion can be replaced using stack data structure.",
        theory: "### Problem with Recursion\nWhile recursion produces clean code, it uses the system's call stack memory. If millions of recursive calls are made, it can lead to a Stack Overflow error.\n\n### Recursion Removal\nWe can remove recursion by implementing our own stack. This simulates the behavior of the computer's internal stack but gives the programmer more control over memory.\n\n### Steps for Removal\n1. Use a loop instead of self-calling functions.\n2. Push the task's parameters onto a manual stack.\n3. Pop the values and process them until the stack is empty.",
        algorithm: [
            "Step 1: Start program",
            "Step 2: Input the number 'n' to calculate factorial",
            "Step 3: Push values from 1 to n into a manual stack",
            "Step 4: Pop values from the stack one by one",
            "Step 5: Multiply the popped values to get the result",
            "Step 6: Display the factorial result",
            "Step 7: Stop program"
        ],
        procedure: [
            "Step 1: Open Data Structure Virtual Lab",
            "Step 2: Select Experiment 6",
            "Step 3: Read Aim and Theory",
            "Step 4: Observe Algorithm",
            "Step 5: Load default stack program",
            "Step 6: Click Run button",
            "Step 7: Observe factorial output",
            "Step 8: Verify result"
        ],
        result: "The program was successfully executed, and recursion was removed using stack data structure. The factorial was calculated correctly using stack operations.",
        conclusion: "From this experiment, we learned how recursion can be replaced using stack data structure. Stack helps simulate recursive function calls manually.",
        defaultCode: `#include<iostream>
using namespace std;

#define MAX 100

int stack[MAX];
int top = -1;

void push(int value)
{
    stack[++top] = value;
}

int pop()
{
    return stack[top--];
}

int main()
{
    int n, i, result = 1;

    cout<<"Enter number: ";
    cin>>n;

    for(i=1;i<=n;i++)
        push(i);

    while(top != -1)
        result = result * pop();

    cout<<"Factorial using stack = "<<result;

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 7,
        title: "Queue and Priority Queue Implementation",
        description: "Implementing standard Queues and Priority Queues for process scheduling.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement queue and priority queue data structures. Queue follows First In First Out (FIFO) principle.",
        theory: "### What is a Queue?\nA queue is a linear data structure that follows the **First In First Out (FIFO)** principle.\n\n### Queue Operations\n- **Enqueue:** Insert an element at the back (rear) of the queue.\n- **Dequeue:** Remove the front element from the queue.\n\n### Priority Queue\nA priority queue is a special type of queue where each element has an associated priority. Elements with higher priority are dequeued before elements with lower priority.",
        algorithm: [
            "Step 1: Start program",
            "Step 2: Initialize queue with MAX size and front = -1, rear = -1",
            "Step 3: Enqueue Operation: Check overflow, then insert element",
            "Step 4: Dequeue Operation: Check underflow, else remove element at front",
            "Step 5: Display queue elements and results",
            "Step 6: Stop program"
        ],
        procedure: [
            "Step 1: Open Data Structure Virtual Lab",
            "Step 2: Select Experiment 7",
            "Step 3: Read Aim and Theory",
            "Step 4: Observe Algorithm",
            "Step 5: Load default queue program",
            "Step 6: Click Run button",
            "Step 7: Observe queue output",
            "Step 8: Verify result"
        ],
        result: "The program was successfully executed, and queue operations insertion and deletion were implemented correctly in FIFO order.",
        conclusion: "From this experiment, we learned how queue and priority queue data structures work. These are useful in many real-world applications.",
        defaultCode: `#include<iostream>
using namespace std;

#define MAX 5

int queue[MAX];
int front = -1, rear = -1;

void enqueue(int value)
{
    if(rear == MAX-1)
        cout<<"Queue Overflow\\n";
    else
    {
        if(front == -1)
            front = 0;

        queue[++rear] = value;

        cout<<value<<" inserted into queue\\n";
    }
}

void dequeue()
{
    if(front == -1 || front > rear)
        cout<<"Queue Underflow\\n";
    else
        cout<<queue[front++]<<" removed from queue\\n";
}

void display()
{
    cout<<"Queue elements:\\n";

    for(int i=front;i<=rear;i++)
        cout<<queue[i]<<endl;
}

int main()
{
    enqueue(10);
    enqueue(20);
    enqueue(30);

    display();

    dequeue();

    display();

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 8,
        title: "Tree Structure and Traversal Techniques",
        description: "Implementing a Binary Tree and performing Inorder, Preorder, and Postorder traversals.",
        difficulty: "Medium",
        objective: "The aim of this experiment is to understand and implement tree data structure and perform different traversal techniques such as inorder, preorder, and postorder.",
        theory: "### What is a Tree?\nA tree is a hierarchical, non-linear data structure that consists of nodes connected by edges.\n\n### Binary Tree\nA binary tree is a type of tree where each node can have a maximum of two children (Left Child and Right Child).\n\n### Tree Traversal\n1. **Inorder:** Left → Root → Right\n2. **Preorder:** Root → Left → Right\n3. **Postorder:** Left → Right → Root",
        algorithm: [
            "Step 1: Start program",
            "Step 2: Create a tree structure using a node with data, left pointer, and right pointer",
            "Step 3: Insert nodes into the tree",
            "Step 4: Perform Inorder traversal (Left, Root, Right)",
            "Step 5: Perform Preorder traversal (Root, Left, Right)",
            "Step 6: Perform Postorder traversal (Left, Right, Root)",
            "Step 7: Display the results of each traversal",
            "Step 8: Stop program"
        ],
        procedure: [
            "Step 1: Open Data Structure Virtual Lab",
            "Step 2: Select Experiment 8",
            "Step 3: Read Aim and Theory",
            "Step 4: Observe Algorithm",
            "Step 5: Load default tree program",
            "Step 6: Click Run button",
            "Step 7: Observe traversal output",
            "Step 8: Verify result"
        ],
        result: "The program was successfully executed, and tree traversal techniques inorder, preorder, and postorder were implemented correctly.",
        conclusion: "From this experiment, we learned how tree data structure works and how to perform traversal techniques.",
        defaultCode: `#include<iostream>
using namespace std;

struct node
{
    int data;
    node *left, *right;
};

node* createNode(int value)
{
    node* newNode = new node();

    newNode->data = value;
    newNode->left = newNode->right = NULL;

    return newNode;
}

void inorder(node* root)
{
    if(root != NULL)
    {
        inorder(root->left);
        cout<<root->data<<" ";
        inorder(root->right);
    }
}

void preorder(node* root)
{
    if(root != NULL)
    {
        cout<<root->data<<" ";
        preorder(root->left);
        preorder(root->right);
    }
}

void postorder(node* root)
{
    if(root != NULL)
    {
        postorder(root->left);
        postorder(root->right);
        cout<<root->data<<" ";
    }
}

int main()
{
    node* root = createNode(10);

    root->left = createNode(20);
    root->right = createNode(30);

    root->left->left = createNode(40);
    root->left->right = createNode(50);

    cout<<"Inorder Traversal: ";
    inorder(root);

    cout<<"\\nPreorder Traversal: ";
    preorder(root);

    cout<<"\\nPostorder Traversal: ";
    postorder(root);

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 9,
        title: "Graph Structure and Traversal Techniques (DFS and BFS)",
        description: "Implementation of Graph representation and traversal using BFS and DFS.",
        difficulty: "Hard",
        objective: "The aim of this experiment is to understand and implement graph data structure and perform traversal techniques such as Depth First Search (DFS) and Breadth First Search (BFS).",
        theory: "### What is a Graph?\nA graph is a non-linear data structure consisting of a finite set of vertices (or nodes) and a set of edges that connect a pair of nodes.\n\n### Graph Traversal\n### 1. Depth First Search (DFS)\nDFS starts at a starting node and explores as far as possible along each branch before backtracking. Uses a **Stack**.\n\n### 2. Breadth First Search (BFS)\nBFS starts at a starting node and explores all neighbor nodes at the present depth before moving on. Uses a **Queue**.",
        algorithm: [
            "Step 1: Start program",
            "Step 2: Create a graph using an adjacency matrix",
            "Step 3: DFS Algorithm: Mark node visited, visit its unvisited neighbors recursively",
            "Step 4: BFS Algorithm: Use a queue to visit nodes level by level, marking them visited",
            "Step 5: Display the results of each traversal technique",
            "Step 6: Stop program"
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab",
            "Step 2: Select Data Structure Lab",
            "Step 3: Select Experiment 9",
            "Step 4: Read Aim and Theory",
            "Step 5: Observe Algorithm",
            "Step 6: Load default graph program",
            "Step 7: Click Run button",
            "Step 8: Observe DFS and BFS output",
            "Step 9: Verify result"
        ],
        result: "The program was successfully executed, and graph traversal techniques DFS and BFS were implemented correctly.",
        conclusion: "From this experiment, we learned how graph data structure works and how to perform DFS and BFS traversal techniques.",
        defaultCode: `#include<iostream>
using namespace std;

#define MAX 10

int graph[MAX][MAX], visited[MAX], n;

void DFS(int node)
{
    cout<<node<<" ";

    visited[node] = 1;

    for(int i=0;i<n;i++)
    {
        if(graph[node][i] == 1 && visited[i] == 0)
        {
            DFS(i);
        }
    }
}

int main()
{
    cout<<"Enter number of vertices: ";
    cin>>n;

    cout<<"Enter adjacency matrix:\\n";

    for(int i=0;i<n;i++)
        for(int j=0;j<n;j++)
            cin>>graph[i][j];

    for(int i=0;i<n;i++)
        visited[i] = 0;

    cout<<"DFS Traversal: ";

    DFS(0);

    return 0;
}`,
        language: "cpp"
    },
    {
        id: 10,
        title: "Shortest Path in Graph using Dijkstra's Algorithm",
        description: "Implementing Dijkstra's algorithm to find the shortest path between nodes.",
        difficulty: "Hard",
        objective: "The aim of this experiment is to understand and implement Dijkstra's Algorithm to find the shortest path between nodes in a graph.",
        theory: "### Dijkstra's Algorithm\nDijkstra's algorithm is a popular algorithm used to find the shortest path from a single source vertex to all other vertices in a weighted graph.\n\n### How it Works\n1. **Initialization:** Assign distance 0 to source node and infinity to all others.\n2. **Min Distance Selection:** Select the unvisited node with the smallest distance.\n3. **Update Neighbors:** Calculate distance through the current node; update if smaller.\n4. **Repeat:** Mark the current node as visited and repeat for all nodes.",
        algorithm: [
            "Step 1: Start program",
            "Step 2: Input the number of vertices and the weighted adjacency matrix",
            "Step 3: Initialize a distance array with infinity (INF) and a visited array with 0",
            "Step 4: Assign distance 0 to the source vertex",
            "Step 5: Find the unvisited vertex with the minimum distance",
            "Step 6: Update the distance of all adjacent vertices",
            "Step 7: Repeat the process until all vertices are processed",
            "Step 8: Display the shortest distance from the source to each vertex",
            "Step 9: Stop program"
        ],
        procedure: [
            "Step 1: Open Virtual Programming Lab",
            "Step 2: Select Data Structure Lab",
            "Step 3: Select Experiment 10",
            "Step 4: Read Aim and Theory",
            "Step 5: Observe Algorithm",
            "Step 6: Load default Dijkstra program",
            "Step 7: Click Run button",
            "Step 8: Observe shortest path output",
            "Step 9: Verify result"
        ],
        result: "The program was successfully executed, and shortest path between graph vertices was calculated using Dijkstra's algorithm.",
        conclusion: "From this experiment, we learned how to find shortest path in a graph using Dijkstra's algorithm. This algorithm is useful in navigation systems and network routing.",
        defaultCode: `#include<iostream>
using namespace std;

#define MAX 10
#define INF 9999

int main()
{
    int graph[MAX][MAX], distance[MAX], visited[MAX];
    int n, i, j, count, min, next;

    cout<<"Enter number of vertices: ";
    cin>>n;

    cout<<"Enter adjacency matrix:\\n";

    for(i=0;i<n;i++)
        for(j=0;j<n;j++)
            cin>>graph[i][j];

    for(i=0;i<n;i++)
    {
        distance[i] = INF;
        visited[i] = 0;
    }

    distance[0] = 0;

    for(count=0;count<n-1;count++)
    {
        min = INF;

        for(i=0;i<n;i++)
        {
            if(distance[i] < min && !visited[i])
            {
                min = distance[i];
                next = i;
            }
        }

        visited[next] = 1;

        for(i=0;i<n;i++)
        {
            if(!visited[i] && graph[next][i] &&
               distance[next] + graph[next][i] < distance[i])
            {
                distance[i] = distance[next] + graph[next][i];
            }
        }
    }

    cout<<"Shortest distances from source:\\n";

    for(i=0;i<n;i++)
        cout<<"0 -> "<<i<<" = "<<distance[i]<<endl;

    return 0;
}`,
        language: "cpp"
    }
];
