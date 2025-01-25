import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ConfigurationService } from '../../config/configuration';
import { AgentResponseInterceptor } from '../../lib/interceptors/response';

@Controller('pragma')
@UseInterceptors(AgentResponseInterceptor)
export class PragmaController {
  constructor(private readonly config: ConfigurationService) {}

  @Get('price')
  async getPriceFeeds() {
    try {
      // Mock data for now - you'll need to add the actual Pragma integration
      const mockPrices = [
        {
          pair: 'BTC/USD',
          price: '34500.00',
          timestamp: Date.now(),
        },
        {
          pair: 'ETH/USD',
          price: '1850.00',
          timestamp: Date.now(),
        }
      ];

      return {
        status: "success",
        data: mockPrices
      };

    } catch (error) {
      console.error('Error fetching Pragma price feeds:', error);
      throw error;
    }
  }
}