#include <linux/module.h>
#define INCLUDE_VERMAGIC
#include <linux/build-salt.h>
#include <linux/elfnote-lto.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

BUILD_SALT;
BUILD_LTO_INFO;

MODULE_INFO(vermagic, VERMAGIC_STRING);
MODULE_INFO(name, KBUILD_MODNAME);

__visible struct module __this_module
__section(".gnu.linkonce.this_module") = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

#ifdef CONFIG_RETPOLINE
MODULE_INFO(retpoline, "Y");
#endif

static const struct modversion_info ____versions[]
__used __section("__versions") = {
	{ 0xe6616ea7, "module_layout" },
	{ 0xd710ee9b, "single_release" },
	{ 0xf8dbac4b, "seq_lseek" },
	{ 0xde4a9d4, "seq_read" },
	{ 0xd74e2269, "remove_proc_entry" },
	{ 0x92997ed8, "_printk" },
	{ 0x1bf425ee, "proc_create" },
	{ 0xd8912672, "seq_printf" },
	{ 0xc60d0620, "__num_online_cpus" },
	{ 0x1e355686, "init_task" },
	{ 0x5b8239ca, "__x86_return_thunk" },
	{ 0x1764af7d, "single_open" },
	{ 0xbdfb6dbb, "__fentry__" },
};

MODULE_INFO(depends, "");


MODULE_INFO(srcversion, "387032607D9B19E09AC4106");
