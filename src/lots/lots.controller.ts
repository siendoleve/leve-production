import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LotsService } from './lots.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { type } from 'os';

@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  /* This is a post route that takes in a body and returns the lotService.create function. */
  @Post()
  create(@Body() createLotDto: CreateLotDto) {
    return this.lotsService.create(createLotDto);
  }

  /* This is a get route that takes in a term and returns the lotService.findOne function. */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.lotsService.findAll(paginationDto);
  }

  /* This is a get route that takes in a term and returns the lotService.findLotsWhitReport function. */
  @Get('/report/expeses-proceeds')
  findLotsWhitReport() {
    return this.lotsService.findLotsWhitReport();
  }

  /* This is a get route that takes in a term and returns the lotService.findProduction function. */
  @Get('/report/production')
  findProduction(
    @Query('initDate') initDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.lotsService.findProduction(initDate, endDate);
  }

  /* This is a get route that takes in a term and returns the lotService.findOne function. */
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.lotsService.findOne(term);
  }

  @Get(':type/:term')
  findAllByTerm(
    @Param('type') type: string,
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.lotsService.findAllByTerm(type, term, paginationDto);
  }

  /* A patch route that takes in an id and returns the lotService.update function. */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLotDto: UpdateLotDto,
  ) {
    return this.lotsService.update(id, updateLotDto);
  }

  /* A delete route that takes in an id and returns the lotService.remove function. */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lotsService.remove(id);
  }
}
