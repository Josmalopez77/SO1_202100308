#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/sched/signal.h>
#include <linux/sched.h>
#include <linux/cpumask.h>

#define PROC_NAME "cpu_202100308"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Tu Nombre");
MODULE_DESCRIPTION("Modulo del Kernel para monitorear CPU");
MODULE_VERSION("1.0");

static int cpu_show(struct seq_file *m, void *v) {
    struct task_struct *task;
    int running = 0;
    int total = 0;
    unsigned int num_cpus;
    unsigned long cpu_usage;

    for_each_process(task) {
        total++;
        if (task->__state == TASK_RUNNING) {
            running++;
        }
    }

    num_cpus = num_online_cpus();
    cpu_usage = (running * 100) / num_cpus;

    seq_printf(m,
        "{\n"
        "  \"total_processes\": %d,\n"
        "  \"running_processes\": %d,\n"
        "  \"online_cpus\": %u,\n"
        "  \"cpu_usage_percent\": %lu\n"
        "}\n",
        total, running, num_cpus, cpu_usage);

    return 0;
}

static int cpu_open(struct inode *inode, struct file *file) {
    return single_open(file, cpu_show, NULL);
}

static const struct proc_ops cpu_ops = {
    .proc_open = cpu_open,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static int __init cpu_module_init(void) {
    proc_create(PROC_NAME, 0, NULL, &cpu_ops);
    printk(KERN_INFO "Modulo CPU cargado\n");
    return 0;
}

static void __exit cpu_module_exit(void) {
    remove_proc_entry(PROC_NAME, NULL);
    printk(KERN_INFO "Modulo CPU descargado\n");
}

module_init(cpu_module_init);
module_exit(cpu_module_exit);
