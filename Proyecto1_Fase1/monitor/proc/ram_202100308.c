#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/mm.h>
#include <linux/sysinfo.h>

#define PROC_NAME "ram_202100308"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Jose Manuel Lopez Lemus");
MODULE_DESCRIPTION("Modulo del Kernel para monitorear RAM");
MODULE_VERSION("1.0");

static int ram_show(struct seq_file *m, void *v) {
    struct sysinfo si;
    si_meminfo(&si);

    unsigned long total = si.totalram * si.mem_unit / 1024 / 1024;
    unsigned long free = si.freeram * si.mem_unit / 1024 / 1024;
    unsigned long used = total - free;
    unsigned long percent = (used * 100) / total;

    seq_printf(m,
        "{\n"
        "  \"total_ram\": %lu,\n"
        "  \"free_ram\": %lu,\n"
        "  \"used_ram\": %lu,\n"
        "  \"ram_usage_percent\": %lu\n"
        "}\n",
        total, free, used, percent);

    return 0;
}

static int ram_open(struct inode *inode, struct file *file) {
    return single_open(file, ram_show, NULL);
}

static const struct proc_ops ram_ops = {
    .proc_open = ram_open,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static int __init ram_init(void) {
    proc_create(PROC_NAME, 0, NULL, &ram_ops);
    printk(KERN_INFO "Modulo RAM cargado\n");
    return 0;
}

static void __exit ram_exit(void) {
    remove_proc_entry(PROC_NAME, NULL);
    printk(KERN_INFO "Modulo RAM descargado\n");
}

module_init(ram_init);
module_exit(ram_exit);
