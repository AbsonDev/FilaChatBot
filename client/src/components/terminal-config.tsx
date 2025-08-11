import { useState } from 'react';
import { Settings, Terminal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTerminalConfig } from "@/hooks/use-terminal-config";

interface TerminalConfigDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  required?: boolean;
}

export function TerminalConfigDialog({ 
  open, 
  onOpenChange, 
  trigger,
  required = false 
}: TerminalConfigDialogProps) {
  const {
    currentTerminal,
    isValidating,
    validationError,
    setTerminal,
    clearTerminal,
  } = useTerminalConfig();

  const [accessKey, setAccessKey] = useState(currentTerminal?.accessKey || '');
  const [isDialogOpen, setIsDialogOpen] = useState(open || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessKey.trim()) {
      return;
    }

    const success = await setTerminal(accessKey);
    if (success && !required) {
      setIsDialogOpen(false);
      onOpenChange?.(false);
    }
  };

  const handleClearConfig = () => {
    clearTerminal();
    setAccessKey('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!required || currentTerminal) {
      setIsDialogOpen(open);
      onOpenChange?.(open);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Terminal
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Configuração do Terminal
          </DialogTitle>
          <DialogDescription>
            {required 
              ? "Configure um terminal para começar a usar o chat."
              : "Configure ou altere o terminal do Filazero."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Terminal Info */}
          {currentTerminal?.terminalInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Terminal Configurado
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Nome:</span>
                    <p className="text-muted-foreground">{currentTerminal.terminalInfo.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Provedor:</span>
                    <p className="text-muted-foreground">{currentTerminal.terminalInfo.provider.name}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Localização:</span>
                    <p className="text-muted-foreground">{currentTerminal.terminalInfo.location.name}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Serviços:</span>
                    <p className="text-muted-foreground">
                      {currentTerminal.terminalInfo.services.length} serviço(s) disponível(is)
                    </p>
                  </div>
                </div>
                
                {!required && (
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleClearConfig}
                      className="w-full"
                    >
                      Limpar Configuração
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Configuration Form */}
          <div className="space-y-4">
            <Separator />
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessKey">
                  Access Key do Terminal
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="accessKey"
                  type="text"
                  placeholder="Ex: d6779a60360d455b9af96c1b68e066c5"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="font-mono text-sm"
                  disabled={isValidating}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Insira a chave de acesso do terminal do Filazero
                </p>
              </div>

              {/* Validation Error */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Actions */}
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isValidating || !accessKey.trim()}
                  className="flex-1"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    'Salvar Terminal'
                  )}
                </Button>
                
                {!required && currentTerminal && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Help Text */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              O Access Key é fornecido pelo administrador do sistema Filazero. 
              Entre em contato com o suporte se não possui essa informação.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component for required terminal setup (first time use)
export function TerminalSetupScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Terminal className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao FilaChatBot
          </h1>
          <p className="text-gray-600">
            Configure um terminal para começar a usar o chat
          </p>
        </div>

        <TerminalConfigDialog
          open={true}
          required={true}
          trigger={<div />} // Hidden trigger since dialog is always open
        />
      </div>
    </div>
  );
}