import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Query } from '@nestjs/common/decorators';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ParseUUIDPipe } from '@nestjs/common/pipes';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  /* A POST request that takes in a body and returns a response. */
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  /* A GET request that takes in a query and returns a response. */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.salesService.findAll(paginationDto);
  }

  @Get('/report')
  findReportSale(
    @Query('initDate') initDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesService.findReportSale(initDate, endDate);
  }

  @Get('/report/abstract/proceeds/expenses')
  findAbstractReportProceedsVsExpenses(
    @Query('initDate') initDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesService.findAbstractReportProceedsVsExpenses(
      initDate,
      endDate,
    );
  }

  @Get('/report/proceeds')
  findReportProceeds(
    @Query('initDate') initDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesService.findReportProceeds(initDate, endDate);
  }

  /* This is a GET request that takes in a parameter and returns a response. */
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.salesService.findOne(term);
  }

  @Get(':type/:term')
  findAllByTerm(
    @Param('type') type: string,
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.salesService.findAllByTerm(type, term, paginationDto);
  }

  /* This is a PATCH request that takes in a parameter and a body and returns a response. */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return this.salesService.update(id, updateSaleDto);
  }

  /* This is a DELETE request that takes in a parameter and returns a response. */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.remove(id);
  }
}
