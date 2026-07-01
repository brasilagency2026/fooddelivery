interface Window {
  MercadoPago: new (publicKey: string, options?: { locale?: string }) => {
    bricks: () => {
      create: (brick: string, containerId: string, settings: any) => Promise<{
        unmount: () => Promise<void>;
      }>;
    };
  };
}
