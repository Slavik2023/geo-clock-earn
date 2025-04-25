
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useSubscription() {
  const { toast } = useToast();

  const upgradeSubscription = async (teamId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('teams')
        .update({
          subscription_plan: 'premium',
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId);

      if (updateError) throw updateError;

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userData.user.id,
          amount: 5,
          status: 'success',
          payment_method: 'credit_card',
        });

      if (paymentError) throw paymentError;

      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'upgrade_subscription',
          entity_type: 'teams',
          entity_id: teamId,
          details: { plan: 'premium', amount: 5 }
        });

      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to upgrade subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  const cancelSubscription = async (teamId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('teams')
        .update({
          subscription_plan: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId);

      if (updateError) throw updateError;

      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'cancel_subscription',
          entity_type: 'teams',
          entity_id: teamId,
          details: { previous_plan: 'premium' }
        });

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    upgradeSubscription,
    cancelSubscription
  };
}
