#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/sched/signal.h>

#define PROC_NAME "procesos_202100308"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Jose Lopez");
MODULE_DESCRIPTION("Modulo que muestra estado de procesos");
MODULE_VERSION("1.0");

static int procesos_show(struct seq_file *m, void *v) {
    int total = 0, running = 0, sleeping = 0, zombie = 0, stopped = 0;
    struct task_struct *task;

    for_each_process(task) {
        total++;
        switch (task->__state) {
            case TASK_RUNNING:
                running++;
                break;
            case TASK_INTERRUPTIBLE:
            case TASK_UNINTERRUPTIBLE:
                sleeping++;
                break;
            case EXIT_ZOMBIE:
                zombie++;
                break;
            case TASK_STOPPED:
                stopped++;
                break;
        }
    }

    seq_printf(m,
        "{\n"
        "  \"procesos_corriendo\": %d,\n"
        "  \"total_procesos\": %d,\n"
        "  \"procesos_durmiendo\": %d,\n"
        "  \"procesos_zombie\": %d,\n"
        "  \"procesos_parados\": %d\n"
        "}\n",
        running, total, sleeping, zombie, stopped
    );

    return 0;
}

static int procesos_open(struct inode *inode, struct file *file) {
    return single_open(file, procesos_show, NULL);
}

static const struct proc_ops procesos_ops = {
    .proc_open = procesos_open,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static int __init procesos_init(void) {
    proc_create(PROC_NAME, 0, NULL, &procesos_ops);
    printk(KERN_INFO "Modulo procesos cargado.\n");
    return 0;
}

static void __exit procesos_exit(void) {
    remove_proc_entry(PROC_NAME, NULL);
    printk(KERN_INFO "Modulo procesos descargado.\n");
}

module_init(procesos_init);
module_exit(procesos_exit);
