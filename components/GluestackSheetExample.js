import React, { useState } from 'react';
import { Button, Text } from '@gluestack-ui/themed';
import { Sheet, SheetBackdrop, SheetContent, SheetHeader, SheetFooter } from '@gluestack-ui/themed';

export default function GluestackSheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setOpen(true)}>
        <Text>Abrir Sheet</Text>
      </Button>
      <Sheet isOpen={open} onClose={() => setOpen(false)}>
        <SheetBackdrop />
        <SheetContent>
          <SheetHeader>
            <Text fontSize={20} fontWeight="bold">Mi Bottom Sheet</Text>
          </SheetHeader>
          <Text>¡Este es un ejemplo de Sheet con Gluestack UI!</Text>
          <SheetFooter>
            <Button onPress={() => setOpen(false)}>
              <Text>Cerrar</Text>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
