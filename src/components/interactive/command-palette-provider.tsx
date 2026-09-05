"use client";

import { useCommandPaletteState } from "@/hooks/use-command-palette";
import { CommandPalette } from "@/components/interactive/command-palette";

export function CommandPaletteProvider() {
  const { isOpen, close } = useCommandPaletteState();

  return <CommandPalette isOpen={isOpen} onClose={close} />;
}
