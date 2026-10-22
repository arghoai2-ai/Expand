import React, { useState } from 'react';
import { FormSheet } from '../common/FormSheet.tsx';
import { Copy, Check, FileCode } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface FlutterFile {
  path: string;
  code: string;
}

export function FlutterCodeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { showToast } = useApp();
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const files: FlutterFile[] = [
    {
      path: 'lib/data/models/stock_out_item.dart',
      code: `import 'package:uuid/uuid.dart';

class StockOutItem {
  final String id;
  final String productName;
  final String? note;
  final DateTime createdAt;

  StockOutItem({
    String? id,
    required this.productName,
    this.note,
    DateTime? createdAt,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() => {
        'id': id,
        'productName': productName,
        'note': note,
        'createdAt': createdAt.toIso8601String(),
      };

  factory StockOutItem.fromMap(Map<String, dynamic> map) {
    return StockOutItem(
      id: map['id'] as String?,
      productName: map['productName'] as String? ?? '',
      note: map['note'] as String?,
      createdAt: DateTime.tryParse(map['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  StockOutItem copyWith({
    String? productName,
    String? note,
  }) {
    return StockOutItem(
      id: id,
      productName: productName ?? this.productName,
      note: note ?? this.note,
      createdAt: createdAt,
    );
  }
}
`,
    },
    {
      path: 'lib/features/stock_out/emergency_stock_out_screen.dart',
      code: `import 'package:flutter/material.dart';
import '../../data/models/stock_out_item.dart';
import '../../data/repositories/stock_out_repository.dart';

class EmergencyStockOutScreen extends StatefulWidget {
  const EmergencyStockOutScreen({super.key});

  @override
  State<EmergencyStockOutScreen> createState() => _EmergencyStockOutScreenState();
}

class _EmergencyStockOutScreenState extends State<EmergencyStockOutScreen> {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _addItem(StockOutRepository repo) {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    final item = StockOutItem(productName: text);
    repo.add(item);
    _textController.clear();
    _focusNode.requestFocus(); // Keep focus for fast rapid batch entry
  }

  @override
  Widget build(BuildContext context) {
    final repo = StockOutRepository.instance;
    final items = repo.getAll();

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Stock-Out / Restock'),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Column(
          children: [
            // Fast-entry Text Field
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF18181B) : const Color(0xFFF4F4F5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      focusNode: _focusNode,
                      decoration: const InputDecoration(
                        hintText: 'Type urgent out-of-stock product...',
                        border: InputBorder.none,
                        isDense: true,
                      ),
                      onSubmitted: (_) => _addItem(repo),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add, size: 20),
                    onPressed: () => _addItem(repo),
                    tooltip: 'Add item',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Emergency Restock Items List
            Expanded(
              child: items.isEmpty
                  ? Center(
                      child: Text(
                        'All critical stock replenished.\nType any emergency out-of-stock item above.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A),
                          fontSize: 13,
                        ),
                      ),
                    )
                  : ListView.separated(
                      itemCount: items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final item = items[index];
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF18181B) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7),
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFE11D48),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  item.productName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                              // One-click delete/clear button
                              IconButton(
                                icon: const Icon(Icons.delete_outline, size: 18),
                                color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A),
                                onPressed: () {
                                  repo.delete(item.id);
                                  setState(() {});
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Cleared "\${item.productName}"'),
                                      action: SnackBarAction(
                                        label: 'UNDO',
                                        onPressed: () {
                                          repo.add(item);
                                          setState(() {});
                                        },
                                      ),
                                    ),
                                  );
                                },
                                tooltip: 'Restocked / Remove',
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
    },
    {
      path: 'lib/data/models/sub_task.dart',
      code: `import 'package:uuid/uuid.dart';

class SubTask {
  final String id;
  final String title;
  final bool isDone;
  final DateTime createdAt;

  SubTask({
    String? id,
    required this.title,
    this.isDone = false,
    DateTime? createdAt,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  SubTask copyWith({
    String? title,
    bool? isDone,
  }) {
    return SubTask(
      id: id,
      title: title ?? this.title,
      isDone: isDone ?? this.isDone,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'title': title,
        'isDone': isDone,
        'createdAt': createdAt.toIso8601String(),
      };

  factory SubTask.fromMap(Map<String, dynamic> map) {
    return SubTask(
      id: map['id'] as String?,
      title: map['title'] as String? ?? '',
      isDone: map['isDone'] as bool? ?? false,
      createdAt: DateTime.tryParse(map['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }
}
`,
    },
    {
      path: 'lib/features/tasks/task_tile.dart',
      code: `import 'package:flutter/material.dart';
import '../../data/models/shop_task.dart';
import '../../data/models/sub_task.dart';

class TaskTile extends StatefulWidget {
  final ShopTask task;
  final VoidCallback onToggleDone;
  final ValueChanged<String> onUpdateTitle;
  final VoidCallback onDelete;
  final ValueChanged<List<SubTask>> onUpdateSubTasks;

  const TaskTile({
    super.key,
    required this.task,
    required this.onToggleDone,
    required this.onUpdateTitle,
    required this.onDelete,
    required this.onUpdateSubTasks,
  });

  @override
  State<TaskTile> createState() => _TaskTileState();
}

class _TaskTileState extends State<TaskTile> {
  bool _isEditing = false;
  bool _isExpanded = false;
  late final TextEditingController _editController;
  final TextEditingController _newSubTaskController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  String? _editingSubTaskId;
  final TextEditingController _subTaskEditController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _editController = TextEditingController(text: widget.task.title);
  }

  @override
  void didUpdateWidget(covariant TaskTile oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_isEditing && oldWidget.task.title != widget.task.title) {
      _editController.text = widget.task.title;
    }
  }

  @override
  void dispose() {
    _editController.dispose();
    _newSubTaskController.dispose();
    _subTaskEditController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _saveEdit() {
    final newTitle = _editController.text.trim();
    if (newTitle.isNotEmpty && newTitle != widget.task.title) {
      widget.onUpdateTitle(newTitle);
    }
    setState(() => _isEditing = false);
  }

  void _addSubTask() {
    final title = _newSubTaskController.text.trim();
    if (title.isEmpty) return;
    final current = List<SubTask>.from(widget.task.subTasks ?? []);
    current.add(SubTask(title: title));
    widget.onUpdateSubTasks(current);
    _newSubTaskController.clear();
    setState(() => _isExpanded = true);
  }

  void _toggleSubTask(String subTaskId) {
    final updated = (widget.task.subTasks ?? []).map((st) {
      return st.id == subTaskId ? st.copyWith(isDone: !st.isDone) : st;
    }).toList();
    widget.onUpdateSubTasks(updated);
  }

  void _deleteSubTask(String subTaskId) {
    final updated = (widget.task.subTasks ?? []).where((st) => st.id != subTaskId).toList();
    widget.onUpdateSubTasks(updated);
  }

  void _saveSubTaskEdit(String subTaskId) {
    final newText = _subTaskEditController.text.trim();
    if (newText.isNotEmpty) {
      final updated = (widget.task.subTasks ?? []).map((st) {
        return st.id == subTaskId ? st.copyWith(title: newText) : st;
      }).toList();
      widget.onUpdateSubTasks(updated);
    }
    setState(() => _editingSubTaskId = null);
  }

  @override
  Widget build(BuildContext context) {
    final isDone = widget.task.status == TaskStatus.done;
    final subTasks = widget.task.subTasks ?? [];
    final completedCount = subTasks.where((s) => s.isDone).length;
    final totalCount = subTasks.length;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Main Task Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                if (!_isEditing)
                  IconButton(
                    icon: Icon(
                      isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                      size: 20,
                      color: isDone ? Colors.teal : Colors.grey,
                    ),
                    onPressed: widget.onToggleDone,
                  ),

                // Main Title or Inline Edit Field
                Expanded(
                  child: _isEditing
                      ? TextField(
                          controller: _editController,
                          focusNode: _focusNode,
                          autofocus: true,
                          style: const TextStyle(fontSize: 14),
                          decoration: const InputDecoration(
                            isDense: true,
                            border: InputBorder.none,
                          ),
                          onSubmitted: (_) => _saveEdit(),
                        )
                      : Text(
                          widget.task.title,
                          style: TextStyle(
                            fontSize: 14,
                            decoration: isDone ? TextDecoration.lineThrough : null,
                            color: isDone
                                ? (isDark ? const Color(0xFF71717A) : const Color(0xFFA1A1AA))
                                : (isDark ? Colors.white : const Color(0xFF18181B)),
                          ),
                        ),
                ),

                // Subtask Toggle Button / Badge
                if (!_isEditing)
                  InkWell(
                    onTap: () => setState(() => _isExpanded = !_isExpanded),
                    borderRadius: BorderRadius.circular(6),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.checklist,
                            size: 15,
                            color: totalCount > 0 ? const Color(0xFF0D9488) : Colors.grey,
                          ),
                          if (totalCount > 0) ...[
                            const SizedBox(width: 4),
                            Text(
                              '$completedCount/$totalCount',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: completedCount == totalCount ? const Color(0xFF0D9488) : Colors.grey,
                              ),
                            ),
                          ],
                          const SizedBox(width: 2),
                          Icon(
                            _isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                            size: 16,
                            color: Colors.grey,
                          ),
                        ],
                      ),
                    ),
                  ),

                // Actions: Edit / Delete
                if (_isEditing) ...[
                  IconButton(
                    icon: const Icon(Icons.check, size: 18),
                    onPressed: _saveEdit,
                    tooltip: 'Save',
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: () {
                      setState(() {
                        _isEditing = false;
                        _editController.text = widget.task.title;
                      });
                    },
                    tooltip: 'Cancel',
                  ),
                ] else ...[
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 17),
                    color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A),
                    onPressed: () {
                      setState(() => _isEditing = true);
                      _focusNode.requestFocus();
                    },
                    tooltip: 'Edit / Modify',
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 18),
                    color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A),
                    onPressed: widget.onDelete,
                    tooltip: 'Delete',
                  ),
                ],
              ],
            ),
          ),

          // Sub-task / Nested Checklist Section
          if (_isExpanded) ...[
            const Divider(height: 1, thickness: 1),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              color: isDark ? const Color(0xFF121214) : const Color(0xFFF9FAFB),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Checklist items
                  for (final st in subTasks)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2.0),
                      child: Row(
                        children: [
                          // Subtask Checkbox
                          GestureDetector(
                            onTap: () => _toggleSubTask(st.id),
                            child: Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: Icon(
                                st.isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                                size: 16,
                                color: st.isDone ? const Color(0xFF0D9488) : Colors.grey,
                              ),
                            ),
                          ),

                          // Subtask Title or Inline Edit
                          Expanded(
                            child: _editingSubTaskId == st.id
                                ? Row(
                                    children: [
                                      Expanded(
                                        child: TextField(
                                          controller: _subTaskEditController,
                                          autofocus: true,
                                          style: const TextStyle(fontSize: 13),
                                          decoration: const InputDecoration(
                                            isDense: true,
                                            contentPadding: EdgeInsets.symmetric(vertical: 4),
                                            border: UnderlineInputBorder(),
                                          ),
                                          onSubmitted: (_) => _saveSubTaskEdit(st.id),
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.check, size: 15),
                                        onPressed: () => _saveSubTaskEdit(st.id),
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(),
                                      ),
                                      const SizedBox(width: 4),
                                      IconButton(
                                        icon: const Icon(Icons.close, size: 15),
                                        onPressed: () => setState(() => _editingSubTaskId = null),
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(),
                                      ),
                                    ],
                                  )
                                : GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _editingSubTaskId = st.id;
                                        _subTaskEditController.text = st.title;
                                      });
                                    },
                                    child: Text(
                                      st.title,
                                      style: TextStyle(
                                        fontSize: 13,
                                        decoration: st.isDone ? TextDecoration.lineThrough : null,
                                        color: st.isDone
                                          ? (isDark ? const Color(0xFF71717A) : const Color(0xFFA1A1AA))
                                          : (isDark ? Colors.white70 : Colors.black87),
                                      ),
                                    ),
                                  ),
                          ),

                          // Edit & Delete actions for subtask
                          if (_editingSubTaskId != st.id) ...[
                            IconButton(
                              icon: const Icon(Icons.edit_outlined, size: 14),
                              color: Colors.grey,
                              padding: const EdgeInsets.all(4),
                              constraints: const BoxConstraints(),
                              onPressed: () {
                                setState(() {
                                  _editingSubTaskId = st.id;
                                  _subTaskEditController.text = st.title;
                                });
                              },
                              tooltip: 'Edit sub-task',
                            ),
                            const SizedBox(width: 6),
                            IconButton(
                              icon: const Icon(Icons.close, size: 14),
                              color: Colors.grey,
                              padding: const EdgeInsets.all(4),
                              constraints: const BoxConstraints(),
                              onPressed: () => _deleteSubTask(st.id),
                              tooltip: 'Delete sub-task',
                            ),
                          ],
                        ],
                      ),
                    ),

                  // Dynamic Fast-entry Field for Sub-task
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.add, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _newSubTaskController,
                          style: const TextStyle(fontSize: 12),
                          decoration: const InputDecoration(
                            hintText: 'Add sub-task / checklist item...',
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(vertical: 4),
                          ),
                          onSubmitted: (_) => _addSubTask(),
                        ),
                      ),
                      TextButton(
                        onPressed: _addSubTask,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          minimumSize: const Size(0, 0),
                        ),
                        child: const Text('Add', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
`,
    },
    {
      path: 'lib/services/due_settlement_service.dart',
      code: `import '../data/models/customer_due.dart';
import '../data/models/finance_entry.dart';
import '../data/repositories/customer_due_repository.dart';
import '../data/repositories/finance_repository.dart';
import 'notification_service.dart';

class DueSettlementService {
  final CustomerDueRepository dueRepo;
  final FinanceRepository financeRepo;
  final NotificationService notificationService;

  DueSettlementService({
    required this.dueRepo,
    required this.financeRepo,
    required this.notificationService,
  });

  /// Settle due: creates income entry, marks settled, cancels reminders.
  Future<void> settle(String dueId) async {
    final due = dueRepo.getById(dueId);
    if (due == null || due.status == DueStatus.settled || due.linkedEntryId != null) {
      return; // Idempotent guard
    }

    final entry = FinanceEntry(
      ledger: Ledger.business,
      type: EntryType.income,
      amountMinor: due.amountMinor,
      label: 'Due settled: \${due.customerName}',
      note: 'Auto-settled from customer credit',
      date: DateTime.now().toIso8601String().substring(0, 10),
      linkedDueId: due.id,
    );

    await financeRepo.upsert(entry);

    try {
      final updatedDue = due.copyWith(
        status: DueStatus.settled,
        settledAt: DateTime.now(),
        linkedEntryId: entry.id,
      );
      await dueRepo.upsert(updatedDue);
      await notificationService.cancelForEntity(due.notifBase);
    } catch (e) {
      await financeRepo.delete(entry.id);
      rethrow;
    }
  }

  /// Reverts a settled due back to outstanding and deletes auto-logged income.
  Future<void> revert(String dueId) async {
    final due = dueRepo.getById(dueId);
    if (due == null || due.linkedEntryId == null) return;

    final entryId = due.linkedEntryId!;
    await financeRepo.delete(entryId);

    final revertedDue = due.copyWith(
      status: DueStatus.outstanding,
      settledAt: null,
      linkedEntryId: null,
    );
    await dueRepo.upsert(revertedDue);
  }
}
`,
    },
    {
      path: 'lib/data/models/customer_due.dart',
      code: `import 'package:uuid/uuid.dart';

enum DueStatus { outstanding, settled }

class CustomerDue {
  final String id;
  final String customerName;
  final String mobileNumber;
  final String? address;
  final int amountMinor;
  final String recordedDate;
  final String expectedPaymentDate;
  final DueStatus status;
  final DateTime? settledAt;
  final String? linkedEntryId;
  final int notifBase;
  final DateTime createdAt;
  final DateTime updatedAt;

  CustomerDue({
    String? id,
    this.customerName = '',
    this.mobileNumber = '',
    this.address,
    this.amountMinor = 0,
    required this.recordedDate,
    this.expectedPaymentDate = '',
    this.status = DueStatus.outstanding,
    this.settledAt,
    this.linkedEntryId,
    int? notifBase,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : id = id ?? const Uuid().v4(),
        notifBase = notifBase ?? DateTime.now().millisecondsSinceEpoch % 100000,
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory CustomerDue.empty() => CustomerDue(
        recordedDate: DateTime.now().toIso8601String().substring(0, 10),
      );

  CustomerDue copyWith({
    String? customerName,
    String? mobileNumber,
    String? address,
    int? amountMinor,
    String? recordedDate,
    String? expectedPaymentDate,
    DueStatus? status,
    DateTime? settledAt,
    String? linkedEntryId,
  }) {
    return CustomerDue(
      id: id,
      customerName: customerName ?? this.customerName,
      mobileNumber: mobileNumber ?? this.mobileNumber,
      address: address ?? this.address,
      amountMinor: amountMinor ?? this.amountMinor,
      recordedDate: recordedDate ?? this.recordedDate,
      expectedPaymentDate: expectedPaymentDate ?? this.expectedPaymentDate,
      status: status ?? this.status,
      settledAt: settledAt ?? this.settledAt,
      linkedEntryId: linkedEntryId ?? this.linkedEntryId,
      notifBase: notifBase,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'customerName': customerName,
        'mobileNumber': mobileNumber,
        'address': address,
        'amountMinor': amountMinor,
        'recordedDate': recordedDate,
        'expectedPaymentDate': expectedPaymentDate,
        'status': status.name,
        'settledAt': settledAt?.toIso8601String(),
        'linkedEntryId': linkedEntryId,
        'notifBase': notifBase,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
      };

  factory CustomerDue.fromMap(Map<String, dynamic> map) {
    return CustomerDue(
      id: map['id'] as String?,
      customerName: map['customerName'] as String? ?? '',
      mobileNumber: map['mobileNumber'] as String? ?? '',
      address: map['address'] as String?,
      amountMinor: (map['amountMinor'] as num?)?.toInt() ?? 0,
      recordedDate: map['recordedDate'] as String? ?? '',
      expectedPaymentDate: map['expectedPaymentDate'] as String? ?? '',
      status: map['status'] == 'settled' ? DueStatus.settled : DueStatus.outstanding,
      settledAt: DateTime.tryParse(map['settledAt'] as String? ?? ''),
      linkedEntryId: map['linkedEntryId'] as String?,
      notifBase: map['notifBase'] as int?,
      createdAt: DateTime.tryParse(map['createdAt'] as String? ?? ''),
      updatedAt: DateTime.tryParse(map['updatedAt'] as String? ?? ''),
    );
  }
}
`,
    },
    {
      path: 'lib/features/dues/customer_due_form_sheet.dart',
      code: `import 'package:flutter/material.dart';
import '../../data/models/customer_due.dart';

/// Modal sheet for "Record Customer Due (Credit)"
/// All fields are completely optional:
/// - No mandatory validation restrictions
/// - No required field checks or asterisks (*)
/// - Can be saved with whatever fields are filled without blocking the user
class CustomerDueFormSheet extends StatefulWidget {
  final CustomerDue? initialDue;
  final ValueChanged<CustomerDue> onSaved;

  const CustomerDueFormSheet({
    super.key,
    this.initialDue,
    required this.onSaved,
  });

  static Future<void> show(
    BuildContext context, {
    CustomerDue? initialDue,
    required ValueChanged<CustomerDue> onSaved,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CustomerDueFormSheet(
        initialDue: initialDue,
        onSaved: onSaved,
      ),
    );
  }

  @override
  State<CustomerDueFormSheet> createState() => _CustomerDueFormSheetState();
}

class _CustomerDueFormSheetState extends State<CustomerDueFormSheet> {
  late final TextEditingController _nameController;
  late final TextEditingController _mobileController;
  late final TextEditingController _addressController;
  late final TextEditingController _amountController;
  late DateTime _recordedDate;
  DateTime? _expectedPaymentDate;

  @override
  void initState() {
    super.initState();
    final d = widget.initialDue;
    _nameController = TextEditingController(text: d?.customerName ?? '');
    _mobileController = TextEditingController(text: d?.mobileNumber ?? '');
    _addressController = TextEditingController(text: d?.address ?? '');
    _amountController = TextEditingController(
      text: d != null && d.amountMinor > 0 ? (d.amountMinor / 100).toStringAsFixed(2) : '',
    );
    _recordedDate = d != null && d.recordedDate.isNotEmpty
        ? DateTime.tryParse(d.recordedDate) ?? DateTime.now()
        : DateTime.now();
    _expectedPaymentDate = d?.expectedPaymentDate != null && d!.expectedPaymentDate.isNotEmpty
        ? DateTime.tryParse(d.expectedPaymentDate)
        : null;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _addressController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  /// Saves the record with whatever fields are filled without blocking the user
  void _submit() {
    final double? parsedAmount = double.tryParse(_amountController.text.trim());
    final int amountMinor = parsedAmount != null ? (parsedAmount * 100).round() : 0;

    final due = (widget.initialDue ?? CustomerDue.empty()).copyWith(
      customerName: _nameController.text.trim(),
      mobileNumber: _mobileController.text.trim(),
      address: _addressController.text.trim().isEmpty ? null : _addressController.text.trim(),
      amountMinor: amountMinor,
      recordedDate: _recordedDate.toIso8601String().substring(0, 10),
      expectedPaymentDate: _expectedPaymentDate != null
          ? _expectedPaymentDate!.toIso8601String().substring(0, 10)
          : '',
    );

    widget.onSaved(due);
    Navigator.of(context).pop();
  }

  Future<void> _pickExpectedDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _expectedPaymentDate ?? now.add(const Duration(days: 1)),
      firstDate: DateTime(2020),
      lastDate: DateTime(2040),
    );
    if (picked != null) {
      setState(() => _expectedPaymentDate = picked);
    }
  }

  Future<void> _pickRecordedDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _recordedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2040),
    );
    if (picked != null) {
      setState(() => _recordedDate = picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF18181B) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  Text(
                    widget.initialDue != null
                        ? 'Edit Customer Due'
                        : 'Record Customer Due (Credit)',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const Text(
                'Track money owed. All fields are optional—save with any details available.',
                style: TextStyle(fontSize: 12, color: Color(0xFF71717A)),
              ),
              const SizedBox(height: 16),

              // Customer / Store Name (Optional - no asterisk or validator)
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Customer / Store Name (Optional)',
                  hintText: 'e.g. Karim Traders / Tariqul Islam',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),

              // Mobile Number (Optional - no asterisk or validator)
              TextField(
                controller: _mobileController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Mobile Number (Optional)',
                  hintText: 'e.g. +880 1711-...',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),

              // Address / Location (Optional)
              TextField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: 'Address / Location (Optional)',
                  hintText: 'Shop #, Market, Area',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),

              // Amount Due (Optional)
              TextField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Amount Due (Optional)',
                  hintText: '0.00',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),

              // Dates (Optional)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.event, size: 16),
                      label: Text(
                        'Given: \${_recordedDate.toIso8601String().substring(0, 10)}',
                        style: const TextStyle(fontSize: 12),
                      ),
                      onPressed: _pickRecordedDate,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: Text(
                        _expectedPaymentDate != null
                            ? 'Expected: \${_expectedPaymentDate!.toIso8601String().substring(0, 10)}'
                            : 'Expected Date (Optional)',
                        style: const TextStyle(fontSize: 12),
                      ),
                      onPressed: _pickExpectedDate,
                    ),
                  ),
                  if (_expectedPaymentDate != null)
                    IconButton(
                      icon: const Icon(Icons.clear, size: 16),
                      onPressed: () => setState(() => _expectedPaymentDate = null),
                      tooltip: 'Clear Date',
                    ),
                ],
              ),
              const SizedBox(height: 20),

              // Submit Action
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _submit,
                  child: Text(widget.initialDue != null ? 'Save Changes' : 'Record Due'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
    },
    {
      path: 'pubspec.yaml',
      code: `name: expand
description: Minimal, distraction-free, offline-first daily management and business operations.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  path_provider: ^2.1.2
  path: ^1.9.0
  image_picker: ^1.0.7
  flutter_local_notifications: ^17.1.0
  timezone: ^0.9.2
  flutter_timezone: ^2.0.0
  intl: ^0.19.0
  uuid: ^4.3.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
    },
  ];

  const currentFile = files[selectedFileIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    showToast(`Copied ${currentFile.path} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Flutter / Dart Source Code"
      subtitle="Complete production-ready Dart files matching the Expand architecture spec"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3 text-xs">
        {/* File Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
          {files.map((f, i) => (
            <button
              key={f.path}
              type="button"
              onClick={() => setSelectedFileIdx(i)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium whitespace-nowrap transition-colors ${
                i === selectedFileIdx
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {f.path.split('/').pop()}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-zinc-400 text-[11px]">{currentFile.path}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
        </div>

        {/* Code Block */}
        <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-[50vh] leading-relaxed select-all">
          <code>{currentFile.code}</code>
        </pre>
      </div>
    </FormSheet>
  );
}
