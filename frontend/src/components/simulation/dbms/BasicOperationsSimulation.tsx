"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table as TableIcon } from "lucide-react";

type DBType = "MySQL" | "Oracle" | "PostgreSQL" | "MS-Access";

interface ColumnDef {
    name: string;
    type: string;
}

interface TableStructure {
    name: string;
    columns: ColumnDef[];
    records: Record<string, string>[];
}

interface DatabaseStructure {
    name: string;
    type: DBType;
    tables: TableStructure[];
}

interface QueryLog {
    id: number;
    timestamp: string;
    query: string;
    type: "CREATE" | "INSERT" | "UPDATE" | "DELETE" | "SELECT" | "SYSTEM" | "ERROR" | "INFO";
    resultTable?: { columns: string[]; rows: Record<string, string>[] };
    message?: string;
}

import { WithMode } from "@/lib/labs/modes";

interface BasicOperationsSimulationProps extends WithMode {
    mode?: "LEARNING" | "EXPERIMENTAL" | "EXAM";
    initialData?: any;
    readonly?: boolean;
}

const DB_TYPES: DBType[] = ["MySQL", "Oracle", "PostgreSQL", "MS-Access"];

export default function BasicOperationsSimulation({ mode = "LEARNING", initialData, readonly = false }: BasicOperationsSimulationProps) {
    const [isExam, setIsExam] = useState(mode === "EXAM");

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('mode=exam')) {
            setIsExam(true);
        }
    }, []);

    // State
    const [selectedDBType, setSelectedDBType] = useState<DBType>("MySQL");
    const [isDbDropdownOpen, setIsDbDropdownOpen] = useState(false);
    const [allDatabases, setAllDatabases] = useState<DatabaseStructure[]>(
        initialData?.allDatabases || (initialData?.database ? [initialData.database] : [])
    );
    const [activeDbName, setActiveDbName] = useState<string>(initialData?.database?.name || "");
    const [queryLogs, setQueryLogs] = useState<QueryLog[]>(initialData?.queryLogs || []);
    const [sqlQuery, setSqlQuery] = useState("");
    const [feedback, setFeedback] = useState("");

    // Active Database Helper
    const activeDB = allDatabases.find(db => db.name.toLowerCase() === activeDbName.toLowerCase()) || null;

    // Modals/Input State
    const [showCreateDBModal, setShowCreateDBModal] = useState(false);
    const [showCreateTableModal, setShowCreateTableModal] = useState(false);
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [activeTableIndex, setActiveTableIndex] = useState<number>(-1);
    const [editingRecordIndex, setEditingRecordIndex] = useState<number | null>(null);

    // Form Inputs
    const [dbNameInput, setDbNameInput] = useState("");
    const [tableNameInput, setTableNameInput] = useState("");
    const [tableColumnsInput, setTableColumnsInput] = useState("");
    const [recordInput, setRecordInput] = useState<Record<string, string>>({});

    const addLog = (
        query: string, 
        type: QueryLog["type"], 
        message?: string, 
        resultTable?: { columns: string[]; rows: Record<string, string>[] }
    ) => {
        const newLog: QueryLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            query,
            type,
            message,
            resultTable
        };
        setQueryLogs(prev => [newLog, ...prev]);
    };

    // -- Comprehensive MySQL Query Engine --
    const executeSQL = () => {
        const rawQuery = sqlQuery.trim();
        if (!rawQuery) return;

        // Support multiple semicolon-separated statements
        const statements = rawQuery.split(';').map(s => s.trim()).filter(Boolean);

        for (const query of statements) {
            const clean = query.trim();
            const lower = clean.toLowerCase();

            try {
                // 1. SHOW DATABASES
                if (lower === "show databases") {
                    const rows = allDatabases.map(db => ({ Database: db.name }));
                    addLog(query, "SELECT", `Found ${rows.length} database(s)`, { columns: ["Database"], rows });
                }
                // 2. USE <db_name>
                else if (lower.startsWith("use ")) {
                    const target = clean.substring(4).trim().replace(/[`"']/g, '');
                    const found = allDatabases.find(d => d.name.toLowerCase() === target.toLowerCase());
                    if (!found) throw new Error(`Unknown database '${target}'`);
                    setActiveDbName(found.name);
                    addLog(query, "SYSTEM", `Database changed to '${found.name}'`);
                }
                // 3. SHOW TABLES
                else if (lower === "show tables") {
                    if (!activeDB) throw new Error("No database selected. Use 'USE db_name;' first.");
                    const colName = `Tables_in_${activeDB.name}`;
                    const rows = activeDB.tables.map(t => ({ [colName]: t.name }));
                    addLog(query, "SELECT", `${rows.length} table(s) in set`, { columns: [colName], rows });
                }
                // 4. DESCRIBE / DESC <table_name>
                else if (lower.startsWith("desc ") || lower.startsWith("describe ")) {
                    if (!activeDB) throw new Error("No database selected.");
                    const parts = clean.split(/\s+/);
                    const tableName = parts[1]?.replace(/[`"']/g, '');
                    const table = activeDB.tables.find(t => t.name.toLowerCase() === tableName?.toLowerCase());
                    if (!table) throw new Error(`Table '${tableName}' doesn't exist.`);

                    const rows = table.columns.map(c => ({
                        Field: c.name,
                        Type: c.type,
                        Null: "YES",
                        Key: "",
                        Default: "NULL"
                    }));
                    addLog(query, "SELECT", `Structure for '${table.name}'`, {
                        columns: ["Field", "Type", "Null", "Key", "Default"],
                        rows
                    });
                }
                // 5. CREATE DATABASE <db_name>
                else if (lower.startsWith("create database")) {
                    const match = clean.match(/create database\s+(`?\w+`?)/i);
                    if (!match) throw new Error("Syntax error in CREATE DATABASE statement.");
                    const name = match[1].replace(/`/g, '');
                    if (allDatabases.some(d => d.name.toLowerCase() === name.toLowerCase())) {
                        throw new Error(`Can't create database '${name}'; database exists.`);
                    }
                    const newDb: DatabaseStructure = { name, type: selectedDBType, tables: [] };
                    setAllDatabases(prev => [...prev, newDb]);
                    if (!activeDbName) setActiveDbName(name);
                    addLog(query, "CREATE", `Query OK, 1 row affected (Database '${name}' created)`);
                }
                // 6. DROP DATABASE <db_name>
                else if (lower.startsWith("drop database")) {
                    const match = clean.match(/drop database\s+(`?\w+`?)/i);
                    if (!match) throw new Error("Syntax error in DROP DATABASE.");
                    const name = match[1].replace(/`/g, '');
                    setAllDatabases(prev => prev.filter(d => d.name.toLowerCase() !== name.toLowerCase()));
                    if (activeDbName.toLowerCase() === name.toLowerCase()) {
                        setActiveDbName("");
                    }
                    addLog(query, "SYSTEM", `Query OK, database '${name}' dropped.`);
                }
                // 7. CREATE TABLE <table_name> (<col_def>)
                else if (lower.startsWith("create table")) {
                    if (!activeDB) throw new Error("No database selected. Choose or CREATE DATABASE first.");
                    const match = clean.match(/create table\s+(`?\w+`?)\s*\(([\s\S]+)\)/i);
                    if (!match) throw new Error("Syntax error in CREATE TABLE definition.");

                    const tableName = match[1].replace(/`/g, '');
                    if (activeDB.tables.some(t => t.name.toLowerCase() === tableName.toLowerCase())) {
                        throw new Error(`Table '${tableName}' already exists.`);
                    }

                    const colRaw = match[2];
                    const columns: ColumnDef[] = colRaw.split(',').map(c => {
                        const tokens = c.trim().split(/\s+/);
                        return { name: tokens[0].replace(/`/g, ''), type: tokens.slice(1).join(" ") || "VARCHAR(50)" };
                    });

                    const newTable: TableStructure = { name: tableName, columns, records: [] };
                    setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? { ...db, tables: [...db.tables, newTable] } : db));
                    addLog(query, "CREATE", `Query OK, 0 rows affected (Table '${tableName}' created)`);
                }
                // 8. DROP TABLE <table_name>
                else if (lower.startsWith("drop table")) {
                    if (!activeDB) throw new Error("No database selected.");
                    const match = clean.match(/drop table\s+(`?\w+`?)/i);
                    if (!match) throw new Error("Syntax error in DROP TABLE.");
                    const tableName = match[1].replace(/`/g, '');

                    setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? {
                        ...db,
                        tables: db.tables.filter(t => t.name.toLowerCase() !== tableName.toLowerCase())
                    } : db));
                    addLog(query, "SYSTEM", `Query OK, table '${tableName}' dropped.`);
                }
                // 9. TRUNCATE [TABLE] <table_name>
                else if (lower.startsWith("truncate")) {
                    if (!activeDB) throw new Error("No database selected.");
                    const match = clean.match(/truncate\s+(?:table\s+)?(`?\w+`?)/i);
                    if (!match) throw new Error("Syntax error in TRUNCATE statement.");
                    const tableName = match[1].replace(/`/g, '');

                    setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? {
                        ...db,
                        tables: db.tables.map(t => t.name.toLowerCase() === tableName.toLowerCase() ? { ...t, records: [] } : t)
                    } : db));
                    addLog(query, "UPDATE", `Query OK, table '${tableName}' truncated.`);
                }
                // 10. INSERT INTO <table_name> [(cols)] VALUES (...)
                else if (lower.startsWith("insert into")) {
                    if (!activeDB) throw new Error("No database selected.");

                    const fullMatch = clean.match(/insert into\s+(`?\w+`?)\s*(?:\(([^)]+)\))?\s*values\s*\(([\s\S]+)\)/i);
                    if (!fullMatch) throw new Error("Syntax error in INSERT statement. Syntax: INSERT INTO table (cols) VALUES (vals);");

                    const tableName = fullMatch[1].replace(/`/g, '');
                    const specifiedCols = fullMatch[2] ? fullMatch[2].split(',').map(c => c.trim().replace(/`/g, '')) : null;
                    const valTokens = fullMatch[3].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));

                    const table = activeDB.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
                    if (!table) throw new Error(`Table '${tableName}' does not exist.`);

                    const targetCols = specifiedCols || table.columns.map(c => c.name);
                    if (valTokens.length !== targetCols.length) {
                        throw new Error(`Column count doesn't match value count at row 1.`);
                    }

                    const newRecord: Record<string, string> = {};
                    table.columns.forEach(col => { newRecord[col.name] = "NULL"; });
                    targetCols.forEach((colName, idx) => { newRecord[colName] = valTokens[idx]; });

                    setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? {
                        ...db,
                        tables: db.tables.map(t => t.name.toLowerCase() === tableName.toLowerCase() ? {
                            ...t,
                            records: [...t.records, newRecord]
                        } : t)
                    } : db));
                    addLog(query, "INSERT", `Query OK, 1 row inserted.`);
                }
                // 11. SELECT <cols|*> FROM <table_name> [WHERE col = val]
                else if (lower.startsWith("select")) {
                    if (!activeDB) throw new Error("No database selected.");

                    const selectMatch = clean.match(/select\s+([\s\S]+?)\s+from\s+(`?\w+`?)(?:\s+where\s+([\s\S]+))?/i);
                    if (!selectMatch) throw new Error("Syntax error in SELECT statement. Example: SELECT * FROM Students WHERE id = 1;");

                    const rawFields = selectMatch[1].trim();
                    const tableName = selectMatch[2].replace(/`/g, '');
                    const whereClause = selectMatch[3]?.trim();

                    const table = activeDB.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
                    if (!table) throw new Error(`Table '${tableName}' doesn't exist.`);

                    let selectedColumns: string[] = [];
                    if (rawFields === "*") {
                        selectedColumns = table.columns.map(c => c.name);
                    } else {
                        selectedColumns = rawFields.split(',').map(f => f.trim().replace(/`/g, ''));
                    }

                    let filteredRecords = table.records;

                    if (whereClause) {
                        const condMatch = whereClause.match(/(`?\w+`?)\s*=\s*(.+)/);
                        if (condMatch) {
                            const col = condMatch[1].replace(/`/g, '').toLowerCase();
                            const val = condMatch[2].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
                            filteredRecords = table.records.filter(r => {
                                const key = Object.keys(r).find(k => k.toLowerCase() === col);
                                return key && r[key]?.toLowerCase() === val;
                            });
                        }
                    }

                    const rows = filteredRecords.map(rec => {
                        const obj: Record<string, string> = {};
                        selectedColumns.forEach(c => {
                            const actualKey = Object.keys(rec).find(k => k.toLowerCase() === c.toLowerCase());
                            obj[c] = actualKey ? rec[actualKey] : "NULL";
                        });
                        return obj;
                    });

                    addLog(query, "SELECT", `${rows.length} row(s) in set`, {
                        columns: selectedColumns,
                        rows
                    });
                }
                // 12. UPDATE <table_name> SET col = val [WHERE condition]
                else if (lower.startsWith("update")) {
                    if (!activeDB) throw new Error("No database selected.");

                    const updateMatch = clean.match(/update\s+(`?\w+`?)\s+set\s+([\s\S]+?)(?:\s+where\s+([\s\S]+))?$/i);
                    if (!updateMatch) throw new Error("Syntax error in UPDATE. Example: UPDATE Students SET name = 'Bob' WHERE id = 1;");

                    const tableName = updateMatch[1].replace(/`/g, '');
                    const setClause = updateMatch[2].trim();
                    const whereClause = updateMatch[3]?.trim();

                    const table = activeDB.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
                    if (!table) throw new Error(`Table '${tableName}' doesn't exist.`);

                    // Parse SET assignments (e.g. col1 = val1, col2 = val2)
                    const updates: { col: string; val: string }[] = setClause.split(',').map(part => {
                        const [c, v] = part.split('=').map(s => s.trim());
                        return { col: c.replace(/`/g, ''), val: v.replace(/^['"]|['"]$/g, '') };
                    });

                    let affectedCount = 0;
                    const updatedRecords = table.records.map(rec => {
                        let matches = true;
                        if (whereClause) {
                            const condMatch = whereClause.match(/(`?\w+`?)\s*=\s*(.+)/);
                            if (condMatch) {
                                const wCol = condMatch[1].replace(/`/g, '').toLowerCase();
                                const wVal = condMatch[2].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
                                const actualKey = Object.keys(rec).find(k => k.toLowerCase() === wCol);
                                if (!actualKey || rec[actualKey]?.toLowerCase() !== wVal) {
                                    matches = false;
                                }
                            }
                        }

                        if (matches) {
                            affectedCount++;
                            const newRec = { ...rec };
                            updates.forEach(u => {
                                const targetKey = Object.keys(newRec).find(k => k.toLowerCase() === u.col.toLowerCase()) || u.col;
                                newRec[targetKey] = u.val;
                            });
                            return newRec;
                        }
                        return rec;
                    });

                    setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? {
                        ...db,
                        tables: db.tables.map(t => t.name.toLowerCase() === tableName.toLowerCase() ? { ...t, records: updatedRecords } : t)
                    } : db));

                    addLog(query, "UPDATE", `Query OK, ${affectedCount} row(s) updated.`);
                }
                // 13. DELETE FROM <table_name> [WHERE condition]
                else if (lower.startsWith("delete from")) {
                    if (!activeDB) throw new Error("No database selected.");

                    const delMatch = clean.match(/delete from\s+(`?\w+`?)(?:\s+where\s+([\s\S]+))?$/i);
                    if (!delMatch) throw new Error("Syntax error in DELETE statement.");

                    const tableName = delMatch[1].replace(/`/g, '');
                    const whereClause = delMatch[2]?.trim();

                    const table = activeDB.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
                    if (!table) throw new Error(`Table '${tableName}' doesn't exist.`);

                    let initialCount = table.records.length;
                    let remainingRecords = table.records;

                    if (whereClause) {
                        const condMatch = whereClause.match(/(`?\w+`?)\s*=\s*(.+)/);
                        if (condMatch) {
                            const wCol = condMatch[1].replace(/`/g, '').toLowerCase();
                            const wVal = condMatch[2].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
                            remainingRecords = table.records.filter(rec => {
                                const actualKey = Object.keys(rec).find(k => k.toLowerCase() === wCol);
                                return !actualKey || rec[actualKey]?.toLowerCase() !== wVal;
                            });
                        }
                    } else {
                        remainingRecords = [];
                    }

                    const deletedRows = initialCount - remainingRecords.length;
                    setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? {
                        ...db,
                        tables: db.tables.map(t => t.name.toLowerCase() === tableName.toLowerCase() ? { ...t, records: remainingRecords } : t)
                    } : db));

                    addLog(query, "DELETE", `Query OK, ${deletedRows} row(s) deleted.`);
                }
                else {
                    throw new Error(`Unsupported SQL command syntax near '${clean.substring(0, 20)}...'`);
                }
            } catch (e: any) {
                addLog(query, "ERROR", e.message);
            }
        }
        setSqlQuery("");
    };

    // -- Modal Handlers --
    const handleCreateDB = () => {
        if (!dbNameInput.trim()) return;
        const name = dbNameInput.trim();
        const newDb: DatabaseStructure = { name, type: selectedDBType, tables: [] };
        setAllDatabases(prev => [...prev, newDb]);
        setActiveDbName(name);
        addLog(`CREATE DATABASE ${name};`, "CREATE", `Database '${name}' initialized.`);
        setDbNameInput("");
        setShowCreateDBModal(false);
    };

    const handleCreateTable = () => {
        if (!activeDB || !tableNameInput.trim()) return;
        const columns: ColumnDef[] = tableColumnsInput.split(',').map(c => {
            const parts = c.trim().split(/\s+/);
            return { name: parts[0], type: parts[1] || "VARCHAR(50)" };
        });
        const colDef = columns.map(c => `${c.name} ${c.type}`).join(", ");
        const newTable: TableStructure = { name: tableNameInput.trim(), columns, records: [] };

        setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? {
            ...db,
            tables: [...db.tables, newTable]
        } : db));

        addLog(`CREATE TABLE ${tableNameInput.trim()} (${colDef});`, "CREATE", `Table '${tableNameInput.trim()}' created.`);
        setTableNameInput("");
        setTableColumnsInput("");
        setShowCreateTableModal(false);
    };

    const handleSaveRecord = () => {
        if (!activeDB || activeTableIndex === -1) return;
        const table = activeDB.tables[activeTableIndex];
        const updatedTables = [...activeDB.tables];

        if (editingRecordIndex !== null) {
            updatedTables[activeTableIndex].records[editingRecordIndex] = recordInput;
            addLog(`UPDATE ${table.name} SET ...;`, "UPDATE", `Record updated.`);
        } else {
            updatedTables[activeTableIndex].records.push(recordInput);
            addLog(`INSERT INTO ${table.name} ...;`, "INSERT", `Record inserted.`);
        }

        setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? { ...db, tables: updatedTables } : db));
        setRecordInput({});
        setEditingRecordIndex(null);
        setShowInsertModal(false);
    };

    const handleDeleteRecord = (tableIndex: number, recordIndex: number) => {
        if (!activeDB) return;
        const table = activeDB.tables[tableIndex];
        const updatedTables = [...activeDB.tables];
        updatedTables[tableIndex].records = updatedTables[tableIndex].records.filter((_, idx) => idx !== recordIndex);

        setAllDatabases(prev => prev.map(db => db.name === activeDB.name ? { ...db, tables: updatedTables } : db));
        addLog(`DELETE FROM ${table.name} WHERE Row = ${recordIndex + 1};`, "DELETE", `Row ${recordIndex + 1} deleted.`);
    };

    const handleReset = () => {
        setAllDatabases([]);
        setActiveDbName("");
        setQueryLogs([]);
        setDbNameInput("");
        setActiveTableIndex(-1);
    };

    return (
        <div className="flex h-full flex-col bg-card font-sans overflow-hidden">
            {/* Top Navigation Header */}
            <header className="bg-card border-b border-border z-10 p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-bold border border-emerald-500/20">
                        {selectedDBType} Engine Active
                    </span>
                    {activeDB && (
                        <span className="text-xs text-muted-foreground font-mono">
                            Active DB: <strong className="text-foreground">{activeDB.name}</strong> ({activeDB.tables.length} table(s))
                        </span>
                    )}
                </div>

                <div className="flex gap-2 items-center">
                    {feedback && <span className="text-xs text-emerald-600 font-medium mr-2">{feedback}</span>}
                    {isExam && !readonly && (
                        <Button onClick={() => {
                            window.parent.postMessage({ type: 'SAVE_EXAM_STATE', payload: { type: 'DBMS_BASIC', database: activeDB, queryLogs } }, '*');
                            setFeedback("Progress saved successfully!");
                            setTimeout(() => setFeedback(""), 3000);
                        }} size="sm" variant="outline" className="h-8 text-xs text-primary border-primary/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                            SAVE PROGRESS
                        </Button>
                    )}
                    {!readonly && (
                        <Button variant="outline" size="sm" onClick={handleReset} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                            <i className="bx bx-trash mr-1" /> Reset Engine
                        </Button>
                    )}
                </div>
            </header>

            {/* Main Interactive Canvas & SQL Console split */}
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 bg-card p-6 overflow-auto relative">
                    {!activeDB ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-2">
                                <i className="bx bx-data text-4xl text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">No Database Selected</h2>
                            <p className="text-xs text-muted-foreground max-w-sm text-center">
                                Select a database flavor and click Initialize Database, or execute <code>CREATE DATABASE my_db;</code> in the SQL console.
                            </p>

                            <div className="flex gap-3 items-center mt-2">
                                {/* Rule 13 Compliant Custom React Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDbDropdownOpen(!isDbDropdownOpen)}
                                        disabled={readonly}
                                        className="px-4 py-2 bg-background border border-border rounded-xl text-xs font-semibold flex items-center gap-2 hover:border-emerald-500 transition-all text-foreground"
                                    >
                                        <span>Flavor: {selectedDBType}</span>
                                        <i className="bx bx-chevron-down text-slate-400" />
                                    </button>

                                    {isDbDropdownOpen && (
                                        <div className="absolute top-full mt-1 left-0 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                                            {DB_TYPES.map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setSelectedDBType(type);
                                                        setIsDbDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {!readonly && (
                                    <Button onClick={() => setShowCreateDBModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-4 py-2">
                                        Initialize Database
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-border flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <i className="bx bx-database text-emerald-600 dark:text-emerald-400 text-xl" />
                                        <span className="font-bold text-base text-foreground">{activeDB.name}</span>
                                        <span className="text-xs text-muted-foreground ml-2">({activeDB.tables.length} tables)</span>
                                    </div>
                                    {!readonly && (
                                        <Button size="sm" onClick={() => setShowCreateTableModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
                                            <i className="bx bx-plus mr-1" /> Create Table
                                        </Button>
                                    )}
                                </div>

                                <div className="p-6 bg-card/50 min-h-[200px]">
                                    {activeDB.tables.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-12 italic text-xs">
                                            No tables created in database '{activeDB.name}'. Use the button above or run <code>CREATE TABLE ...;</code> in console.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {activeDB.tables.map((table, tIdx) => (
                                                <div key={tIdx} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                                                    <div className="px-4 py-2.5 border-b border-border bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                                                        <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                                                            <TableIcon size={14} className="text-emerald-500" /> {table.name}
                                                        </div>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => { setActiveTableIndex(tIdx); setEditingRecordIndex(null); setRecordInput({}); setShowInsertModal(true); }}>
                                                            <i className="bx bx-plus text-lg" />
                                                        </Button>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                            <thead className="bg-slate-100 dark:bg-slate-800/80 text-muted-foreground">
                                                                <tr>
                                                                    {table.columns.map(c => (
                                                                        <th key={c.name} className="px-3 py-2 text-left border-r border-border last:border-r-0 font-bold">
                                                                            {c.name} <span className="text-[10px] text-muted-foreground font-normal">({c.type})</span>
                                                                        </th>
                                                                    ))}
                                                                    {!readonly && <th className="px-3 py-2 text-right font-bold">Actions</th>}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border">
                                                                {table.records.map((rec, rIdx) => (
                                                                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                                                                        {table.columns.map(c => (
                                                                            <td key={c.name} className="px-3 py-2 border-r border-border last:border-r-0 text-foreground font-mono">
                                                                                {rec[c.name] ?? "NULL"}
                                                                            </td>
                                                                        ))}
                                                                        {!readonly && (
                                                                            <td className="px-3 py-2 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button onClick={() => { setActiveTableIndex(tIdx); setEditingRecordIndex(rIdx); setRecordInput({ ...rec }); setShowInsertModal(true); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-emerald-600">
                                                                                    <i className="bx bx-edit text-sm" />
                                                                                </button>
                                                                                <button onClick={() => handleDeleteRecord(tIdx, rIdx)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded text-rose-600">
                                                                                    <i className="bx bx-trash text-sm" />
                                                                                </button>
                                                                            </td>
                                                                        )}
                                                                    </tr>
                                                                ))}
                                                                {table.records.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan={table.columns.length + (readonly ? 0 : 1)} className="px-3 py-4 text-center text-muted-foreground italic text-xs">
                                                                            Empty Table (No records)
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Sidebar - Full Interactive SQL Terminal Console */}
                <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 font-mono text-xs">
                    <div className="flex-1 flex flex-col border-b border-slate-800">
                        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <i className="bx bx-terminal text-emerald-400 text-base" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">MySQL Console</span>
                            </div>
                            <span className="text-[10px] text-slate-500">Press Run or Execute</span>
                        </div>

                        <div className="flex-1 bg-slate-900 p-3">
                            <textarea
                                value={sqlQuery}
                                onChange={(e) => setSqlQuery(e.target.value)}
                                disabled={readonly}
                                placeholder="Type MySQL statements here... (e.g. SHOW DATABASES; USE db; SELECT * FROM table;)"
                                className="w-full h-full bg-transparent text-emerald-300 font-mono text-xs outline-none resize-none placeholder-slate-600"
                            />
                        </div>

                        {!readonly && (
                            <div className="bg-slate-950 p-2.5 flex justify-between items-center border-t border-slate-800">
                                <span className="text-[10px] text-slate-500">Supports DDL, DML, DQL & System queries</span>
                                <Button size="sm" onClick={executeSQL} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-4 rounded-lg">
                                    <i className="bx bx-play mr-1" /> Execute
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Execution Logs & Query Result Grids */}
                    <div className="h-1/2 flex flex-col bg-slate-950 text-slate-300">
                        <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Output & Result Grid</span>
                            <span className="text-[10px] text-slate-500">{queryLogs.length} entries</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-[11px]">
                            {queryLogs.length === 0 ? (
                                <p className="text-slate-600 italic">No query output yet. Type a query and execute...</p>
                            ) : (
                                queryLogs.map(log => (
                                    <div key={log.id} className="space-y-1.5 border-l-2 border-emerald-500/50 pl-2.5">
                                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                                            <span>[{log.timestamp}]</span>
                                            <span className={`font-bold ${log.type === 'ERROR' ? 'text-rose-400' : 'text-emerald-400'}`}>{log.type}</span>
                                        </div>
                                        <div className="text-slate-200 font-mono font-bold break-all">{log.query}</div>

                                        {log.message && (
                                            <div className={log.type === 'ERROR' ? 'text-rose-400' : 'text-slate-400'}>
                                                {log.message}
                                            </div>
                                        )}

                                        {/* Dynamic Result Table Grid */}
                                        {log.resultTable && log.resultTable.columns.length > 0 && (
                                            <div className="mt-2 border border-slate-800 rounded-lg overflow-x-auto bg-slate-900">
                                                <table className="w-full text-left text-[10px]">
                                                    <thead className="bg-slate-800 text-emerald-400 font-bold border-b border-slate-700">
                                                        <tr>
                                                            {log.resultTable.columns.map(col => (
                                                                <th key={col} className="px-2 py-1 border-r border-slate-700 last:border-r-0">{col}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800">
                                                        {log.resultTable.rows.map((row, rIdx) => (
                                                            <tr key={rIdx} className="hover:bg-slate-800/40">
                                                                {log.resultTable!.columns.map(col => (
                                                                    <td key={col} className="px-2 py-1 border-r border-slate-800 last:border-r-0 text-slate-300">
                                                                        {row[col] ?? "NULL"}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                        {log.resultTable.rows.length === 0 && (
                                                            <tr>
                                                                <td colSpan={log.resultTable.columns.length} className="px-2 py-2 text-center text-slate-600 italic">
                                                                    Empty result set
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modals */}
            {showCreateDBModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl p-6 w-96 shadow-xl space-y-4">
                        <h3 className="text-lg font-bold text-foreground">Create Database</h3>
                        <input
                            type="text"
                            placeholder="Database Name (e.g. university_db)"
                            value={dbNameInput}
                            onChange={(e) => setDbNameInput(e.target.value)}
                            className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:border-emerald-500 outline-none text-foreground"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setShowCreateDBModal(false)}>Cancel</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={handleCreateDB}>Create</Button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateTableModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl p-6 w-96 shadow-xl space-y-4">
                        <h3 className="text-lg font-bold text-foreground">Create Table</h3>
                        <p className="text-xs text-muted-foreground">In active database: <strong>{activeDB?.name}</strong></p>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Table Name (e.g. Students)"
                                value={tableNameInput}
                                onChange={(e) => setTableNameInput(e.target.value)}
                                className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:border-emerald-500 outline-none text-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Columns (e.g. id INT, name VARCHAR, age INT)"
                                value={tableColumnsInput}
                                onChange={(e) => setTableColumnsInput(e.target.value)}
                                className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:border-emerald-500 outline-none text-foreground"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setShowCreateTableModal(false)}>Cancel</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={handleCreateTable}>Create Table</Button>
                        </div>
                    </div>
                </div>
            )}

            {showInsertModal && activeTableIndex !== -1 && activeDB && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl p-6 w-96 shadow-xl space-y-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-foreground">{editingRecordIndex !== null ? "Edit Record" : "Insert Record"}</h3>
                        <p className="text-xs text-muted-foreground">Table: <strong>{activeDB.tables[activeTableIndex].name}</strong></p>
                        <div className="space-y-3">
                            {activeDB.tables[activeTableIndex].columns.map(col => (
                                <div key={col.name}>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{col.name} ({col.type})</label>
                                    <input
                                        type="text"
                                        placeholder={`Value for ${col.name}`}
                                        value={recordInput[col.name] || ""}
                                        onChange={(e) => setRecordInput({ ...recordInput, [col.name]: e.target.value })}
                                        className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:border-emerald-500 outline-none text-foreground mt-1"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={() => { setShowInsertModal(false); setRecordInput({}); setEditingRecordIndex(null); }}>Cancel</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={handleSaveRecord}>
                                {editingRecordIndex !== null ? "Update" : "Insert"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
